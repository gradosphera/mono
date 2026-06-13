import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { Cooperative, Ledger2 } from 'cooptypes';
import { config } from '~/config';
import { ParticipantInteractor } from '~/application/participant/interactors/participant.interactor';
import { GeneratedDocumentDTO } from '~/application/document/dto/generated-document.dto';
import { ACCOUNT_BLOCKCHAIN_PORT, type AccountBlockchainPort } from '~/domain/account/interfaces/account-blockchain.port';
import { USER_WALLET_REPOSITORY, type UserWalletRepository } from '~/domain/wallet/repositories/user-wallet.repository';
import { BLOCKCHAIN_PORT, type BlockchainPort } from '~/domain/common/ports/blockchain.port';
import { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { CreateMembershipExitInputDTO } from '../dto/create-membership-exit-input.dto';
import { MembershipExitResultDTO } from '../dto/membership-exit-result.dto';
import { MembershipExitReturnPreviewDTO } from '../dto/membership-exit-return-preview.dto';

@Injectable()
export class MembershipExitService {
  private readonly logger = new Logger(MembershipExitService.name);

  constructor(
    private readonly participantInteractor: ParticipantInteractor,
    @Inject(ACCOUNT_BLOCKCHAIN_PORT)
    private readonly accountBlockchainPort: AccountBlockchainPort,
    @Inject(USER_WALLET_REPOSITORY)
    private readonly userWalletRepository: UserWalletRepository,
    @Inject(BLOCKCHAIN_PORT)
    private readonly blockchainPort: BlockchainPort
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
   * Подача заявления на выход. Пайщик может подать выход за себя; председатель
   * и член совета — за любого пайщика (операторская подача). Документ заявления
   * проверяется контрактом on-chain (registrator::exitcoop).
   */
  async createMembershipExit(
    data: CreateMembershipExitInputDTO,
    currentUser: MonoAccountDomainInterface
  ): Promise<MembershipExitResultDTO> {
    const isOperator = currentUser.role === 'chairman' || currentUser.role === 'member';
    if (!isOperator && data.username !== currentUser.username) {
      throw new ForbiddenException('Подать заявление на выход можно только за себя');
    }

    await this.accountBlockchainPort.exitCoop({
      coopname: data.coopname,
      username: data.username,
      exit_hash: data.exit_hash,
      statement: data.statement,
    });

    this.logger.log(`Создан процесс выхода из кооператива: ${data.exit_hash} (username=${data.username})`);

    return { exit_hash: data.exit_hash };
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
