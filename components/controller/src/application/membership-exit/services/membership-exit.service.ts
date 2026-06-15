import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cooperative, Ledger2 } from 'cooptypes';
import { Workflows } from '@coopenomics/notifications';
import { config } from '~/config';
import { ParticipantInteractor } from '~/application/participant/interactors/participant.interactor';
import { TokenApplicationService } from '~/application/token/services/token-application.service';
import { NotificationSenderService } from '~/application/notification/services/notification-sender.service';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { ACCOUNT_BLOCKCHAIN_PORT, type AccountBlockchainPort } from '~/domain/account/interfaces/account-blockchain.port';
import { USER_WALLET_REPOSITORY, type UserWalletRepository } from '~/domain/wallet/repositories/user-wallet.repository';
import { BLOCKCHAIN_PORT, type BlockchainPort } from '~/domain/common/ports/blockchain.port';
import { USER_DOMAIN_SERVICE, type UserDomainService } from '~/domain/user/services/user-domain.service';
import { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { MembershipExitRequestEntity } from '~/infrastructure/database/typeorm/entities/membership-exit-request.entity';
import { tokenTypes } from '~/types/token.types';
import { CreateMembershipExitInputDTO } from '../dto/create-membership-exit-input.dto';
import { MembershipExitResultDTO } from '../dto/membership-exit-result.dto';
import { MembershipExitReturnPreviewDTO } from '../dto/membership-exit-return-preview.dto';
import { MembershipExitDTO } from '../dto/membership-exit.dto';
import { MembershipExitStatus } from '../enums/membership-exit-status.enum';

@Injectable()
export class MembershipExitService {
  private readonly logger = new Logger(MembershipExitService.name);

  constructor(
    private readonly participantInteractor: ParticipantInteractor,
    private readonly tokenApplicationService: TokenApplicationService,
    private readonly notificationSenderService: NotificationSenderService,
    @Inject(ACCOUNT_BLOCKCHAIN_PORT)
    private readonly accountBlockchainPort: AccountBlockchainPort,
    @Inject(USER_WALLET_REPOSITORY)
    private readonly userWalletRepository: UserWalletRepository,
    @Inject(BLOCKCHAIN_PORT)
    private readonly blockchainPort: BlockchainPort,
    @Inject(USER_DOMAIN_SERVICE)
    private readonly userDomainService: UserDomainService,
    @InjectRepository(MembershipExitRequestEntity)
    private readonly exitRequestRepository: Repository<MembershipExitRequestEntity>
  ) {}

  async generateMembershipExitApplication(
    data: Cooperative.Registry.ParticipantExitApplication.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.participantInteractor.generateMembershipExitApplication(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  async generateMembershipExitDecision(
    data: Cooperative.Registry.DecisionOfParticipantExit.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<GeneratedDocumentDTO> {
    const document = await this.participantInteractor.generateMembershipExitDecision(data, options);
    return document as unknown as GeneratedDocumentDTO;
  }

  /**
   * Подача заявления на выход. Заявление подписывается пайщиком на клиенте и
   * сразу принимается: сохраняется off-chain и требует подтверждения по ссылке
   * из письма. В блокчейн (registrator::exitcoop) отправляется только после
   * перехода по ссылке — см. confirmMembershipExit. Это двойное подтверждение
   * необратимого действия (закрытие аккаунта). Пайщик подаёт выход за себя;
   * председатель/член совета — за любого пайщика (операторская подача).
   */
  async createMembershipExit(
    data: CreateMembershipExitInputDTO,
    currentUser: MonoAccountDomainInterface
  ): Promise<MembershipExitResultDTO> {
    const isOperator = currentUser.role === 'chairman' || currentUser.role === 'member';
    if (!isOperator && data.username !== currentUser.username) {
      throw new ForbiddenException('Подать заявление на выход можно только за себя');
    }

    // Уже идёт выход on-chain?
    const onchain = await this.accountBlockchainPort.getExit(data.coopname, data.username);
    if (onchain) {
      throw new BadRequestException('Процесс выхода уже запущен и отправлен в блокчейн');
    }

    // Уже есть заявление, ожидающее подтверждения по email?
    const existing = await this.exitRequestRepository.findOne({
      where: { coopname: data.coopname, username: data.username },
    });
    if (existing) {
      throw new BadRequestException(
        'Заявление на выход уже подано и ожидает подтверждения по ссылке из письма'
      );
    }

    const user = await this.userDomainService.getUserByUsername(data.username);
    const confirmToken = await this.tokenApplicationService.generateConfirmExitToken(user.id);

    await this.exitRequestRepository.save(
      this.exitRequestRepository.create({
        coopname: data.coopname,
        username: data.username,
        exit_hash: data.exit_hash,
        statement: data.statement as unknown as Record<string, any>,
        token: confirmToken,
      })
    );

    const confirmationUrl = `${config.frontend_url}/${config.coopname}/user/membership-exit/confirm?token=${confirmToken}`;
    await this.notificationSenderService.sendNotificationToUser(
      data.username,
      Workflows.MembershipExitConfirmation.id,
      { confirmationUrl }
    );

    this.logger.log(
      `Принято заявление на выход (ожидает email-подтверждения): ${data.exit_hash} (username=${data.username})`
    );

    return { exit_hash: data.exit_hash, status: MembershipExitStatus.AWAITING_CONFIRMATION };
  }

  /**
   * Подтверждение выхода по ссылке из письма. Проверяет токен, берёт сохранённое
   * подписанное заявление и только теперь отправляет его в блокчейн
   * (registrator::exitcoop ключом кооператива). Запись-черновик удаляется —
   * далее источником истины служит on-chain registrator::exits.
   */
  async confirmMembershipExit(token: string): Promise<MembershipExitResultDTO> {
    await this.tokenApplicationService.verifyToken({ token, types: [tokenTypes.CONFIRM_EXIT] });

    const request = await this.exitRequestRepository.findOne({ where: { token } });
    if (!request) {
      throw new NotFoundException('Заявление на выход не найдено или уже подтверждено');
    }

    await this.accountBlockchainPort.exitCoop({
      coopname: request.coopname,
      username: request.username,
      exit_hash: request.exit_hash,
      statement: request.statement as any,
    });

    await this.exitRequestRepository.delete({ id: request.id });
    await this.tokenApplicationService.findOneAndDelete(token, tokenTypes.CONFIRM_EXIT);

    this.logger.log(
      `Выход подтверждён и отправлен в блокчейн: ${request.exit_hash} (username=${request.username})`
    );

    return { exit_hash: request.exit_hash, status: MembershipExitStatus.PENDING };
  }

  /**
   * Отмена заявления на выход до подтверждения по email. Удаляет черновик и
   * аннулирует токен подтверждения. Доступно пайщику (за себя) и оператору.
   */
  async cancelMembershipExit(
    coopname: string,
    username: string,
    currentUser: MonoAccountDomainInterface
  ): Promise<boolean> {
    const isOperator = currentUser.role === 'chairman' || currentUser.role === 'member';
    if (!isOperator && username !== currentUser.username) {
      throw new ForbiddenException('Отменить выход можно только за себя');
    }

    const request = await this.exitRequestRepository.findOne({ where: { coopname, username } });
    if (!request) {
      throw new BadRequestException('Нет заявления на выход, ожидающего подтверждения');
    }

    await this.exitRequestRepository.delete({ id: request.id });
    await this.tokenApplicationService.findOneAndDelete(request.token, tokenTypes.CONFIRM_EXIT);

    this.logger.log(`Заявление на выход отменено до подтверждения (username=${username})`);
    return true;
  }

  /**
   * Текущий процесс выхода пайщика (если активен) — для блокировки кабинета и
   * отображения статуса заявления и планируемой суммы возврата. null — выхода нет.
   */
  async getMembershipExit(coopname: string, username: string): Promise<MembershipExitDTO | null> {
    const exit = await this.accountBlockchainPort.getExit(coopname, username);
    if (exit) {
      return {
        exit_hash: exit.exit_hash,
        status: exit.status as MembershipExitStatus,
        quantity: exit.quantity,
        created_at: exit.created_at,
      };
    }

    // Off-chain фаза: заявление подписано, но ещё не подтверждено по email.
    const pending = await this.exitRequestRepository.findOne({ where: { coopname, username } });
    if (pending) {
      return {
        exit_hash: pending.exit_hash,
        status: MembershipExitStatus.AWAITING_CONFIRMATION,
        quantity: '',
        created_at: pending.created_at.toISOString(),
      };
    }

    return null;
  }

  /**
   * Предварительный расчёт суммы возврата паевого взноса при выходе пайщика —
   * минимальный (w.reg.minshr) + целевой (w.wal.share) паевой по L3-балансам.
   */
  async getReturnPreview(coopname: string, username: string): Promise<MembershipExitReturnPreviewDTO> {
    const [shareRow, minRow] = await Promise.all([
      this.userWalletRepository.findByWalletAndUsername(coopname, Ledger2.SHARE_WALLET_NAME, username),
      this.userWalletRepository.findByWalletAndUsername(coopname, Ledger2.MIN_SHARE_WALLET_NAME, username),
    ]);

    const share = shareRow?.present !== false ? shareRow?.available : undefined;
    const minimum = minRow?.present !== false ? minRow?.available : undefined;

    const template = await this.resolveAssetTemplate(coopname, share ?? minimum);
    const shareAsset = share ?? this.zeroAssetLike(template);
    const minimumAsset = minimum ?? this.zeroAssetLike(template);

    return {
      total: this.sumAssets(shareAsset, minimumAsset),
      share_contribution: shareAsset,
      minimum_contribution: minimumAsset,
    };
  }

  /** Сумма двух asset-строк одного символа («100.0000 RUB»). */
  private sumAssets(a: string, b: string): string {
    const [amountA, sym] = a.split(' ');
    const [amountB] = b.split(' ');
    const precision = (amountA.split('.')[1] || '').length;
    const total = Number(amountA) + Number(amountB);
    return `${total.toFixed(precision)} ${sym}`;
  }

  /** Нулевой asset в символе/точности образца. */
  private zeroAssetLike(template: string): string {
    const [amount, sym] = template.split(' ');
    const precision = (amount.split('.')[1] || '').length;
    return `${(0).toFixed(precision)} ${sym}`;
  }

  /** Образец asset для нулей — из имеющегося баланса либо из настроек кооператива. */
  private async resolveAssetTemplate(coopname: string, sample?: string): Promise<string> {
    if (sample) return sample;
    const coop = await this.blockchainPort.getCooperative(coopname);
    const precision = config.blockchain.root_govern_precision ?? 4;
    const symbol = config.blockchain.root_govern_symbol ?? 'RUB';
    return (coop?.initial as string | undefined) ?? `${(0).toFixed(precision)} ${symbol}`;
  }
}
