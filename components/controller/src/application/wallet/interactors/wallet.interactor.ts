import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cooperative } from 'cooptypes';
import { GeneratorInfrastructureService } from '~/infrastructure/generator/generator.service';
import { DocumentDomainEntity } from '~/domain/document/entity/document-domain.entity';
import { WalletBlockchainPort, WALLET_BLOCKCHAIN_PORT } from '~/domain/wallet/ports/wallet-blockchain.port';
import { ProgramWalletRepository, PROGRAM_WALLET_REPOSITORY } from '~/domain/wallet/repositories/program-wallet.repository';
import { ProgramWalletDomainEntity } from '~/domain/wallet/entities/program-wallet-domain.entity';
import type { CreateWithdrawInputDomainInterface } from '~/domain/wallet/interfaces/create-withdraw-input-domain.interface';
import { GATEWAY_INTERACTOR_PORT, GatewayInteractorPort } from '~/domain/wallet/ports/gateway-interactor.port';
import type { CreateDepositPaymentInputDomainInterface } from '~/domain/gateway/interfaces/create-deposit-payment-input-domain.interface';
import { PaymentDomainEntity } from '~/domain/gateway/entities/payment-domain.entity';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';
import type { ProgramWalletFilterInputDTO } from '../dto/program-wallet-filter-input.dto';
import { PaginationResult, PaginationInputDTO } from '~/application/common/dto/pagination.dto';
import { getProgramId } from '~/domain/wallet/enums/program-type.enum';
import { config } from '~/config';

/**
 * Интерактор приложения wallet для управления паевыми взносами, их возвратами, генерацией документов и работой с программными кошельками
 */
@Injectable()
export class WalletInteractor {
  private readonly logger = new Logger(WalletInteractor.name);

  constructor(
    private readonly generatorInfrastructureService: GeneratorInfrastructureService,
    @Inject(WALLET_BLOCKCHAIN_PORT)
    private readonly walletBlockchainPort: WalletBlockchainPort,
    @Inject(PROGRAM_WALLET_REPOSITORY)
    private readonly programWalletRepository: ProgramWalletRepository,
    @Inject(GATEWAY_INTERACTOR_PORT)
    private readonly gatewayInteractorPort: GatewayInteractorPort
  ) {}

  /**
   * Создать депозитный платеж
   */
  async createDepositPayment(data: CreateDepositPaymentInputDomainInterface): Promise<PaymentDomainEntity> {
    return await this.gatewayInteractorPort.createDeposit(data);
  }

  /**
   * Генерация документа заявления на возврат паевого взноса (900)
   */
  async generateReturnByMoneyStatementDocument(
    data: Cooperative.Registry.ReturnByMoney.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    // Устанавливаем registry_id для документа заявления
    data.registry_id = Cooperative.Registry.ReturnByMoney.registry_id;
    return await this.generatorInfrastructureService.generateDocument({ data, options });
  }

  /**
   * Генерация документа решения совета о возврате паевого взноса (901)
   */
  async generateReturnByMoneyDecisionDocument(
    data: Cooperative.Registry.ReturnByMoneyDecision.Action,
    options: Cooperative.Document.IGenerationOptions
  ): Promise<DocumentDomainEntity> {
    // Устанавливаем registry_id для документа решения
    data.registry_id = Cooperative.Registry.ReturnByMoneyDecision.registry_id;
    return await this.generatorInfrastructureService.generateDocument({ data, options });
  }

  /**
   * Создание заявки на вывод средств (createWithdraw)
   * Данный метод создает платеж в gateway и withdraw в blockchain
   */
  async createWithdraw(data: CreateWithdrawInputDomainInterface): Promise<{ withdraw_hash: string }> {
    // Используем payment_hash из параметров вместо генерации нового
    const withdraw_hash = data.payment_hash;

    let createdPayment: PaymentDomainEntity | null = null;

    try {
      // 1. Создаем исходящий платеж в gateway для отслеживания
      createdPayment = await this.gatewayInteractorPort.createWithdraw({
        coopname: data.coopname,
        username: data.username,
        quantity: data.quantity,
        symbol: data.symbol,
        method_id: data.method_id,
        statement: data.statement,
        payment_hash: data.payment_hash,
      });

      // 2. Создаем withdraw в wallet контракте
      // wallet контракт автоматически создаст outcome в gateway контракте
      await this.walletBlockchainPort.createWithdraw({
        coopname: data.coopname,
        username: data.username,
        withdraw_hash,
        quantity: `${data.quantity} ${data.symbol}`,
        statement: data.statement,
      });

      this.logger.log(`Создан withdraw в wallet: ${withdraw_hash}, outcome будет создан автоматически в gateway`);

      return { withdraw_hash };
    } catch (error: any) {
      this.logger.error(`Ошибка при создании withdraw: ${error.message}`, error);

      // Если платеж был создан, но произошла ошибка при создании withdraw в блокчейне
      if (createdPayment?.id) {
        try {
          // Обновляем статус платежа на FAILED с сообщением об ошибке
          await this.gatewayInteractorPort.setPaymentStatus({
            id: createdPayment.id,
            status: PaymentStatusEnum.FAILED,
          });

          this.logger.log(`Платеж ${createdPayment.id} помечен как FAILED из-за ошибки создания withdraw`);
        } catch (updateError: any) {
          this.logger.error(`Ошибка при обновлении статуса платежа: ${updateError.message}`, updateError);
        }
      }

      throw error;
    }
  }

  /**
   * Получить программные кошельки с пагинацией
   * Извлекает кошельки из базы данных с возможностью фильтрации и пагинации
   */
  async getProgramWalletsPaginated(filter?: ProgramWalletFilterInputDTO, pagination?: PaginationInputDTO): Promise<PaginationResult<ProgramWalletDomainEntity>> {
    const coopname = config.coopname;

    // Преобразуем program_type в program_id если указан
    let program_id = filter?.program_id;
    if (filter?.program_type && !program_id) {
      program_id = getProgramId(filter.program_type);
    }

    // Создаем объект фильтра для репозитория
    const repositoryFilter = {
      coopname: filter?.coopname || coopname,
      username: filter?.username,
      program_id,
    };

    // Параметры пагинации с дефолтными значениями
    const paginationOptions = {
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
      sortBy: pagination?.sortBy,
      sortOrder: (pagination?.sortOrder || 'ASC') as 'ASC' | 'DESC',
    };

    // Получаем данные из репозитория
    const wallets = await this.getProgramWalletsFromRepository(repositoryFilter);

    // Применяем пагинацию вручную
    const totalCount = wallets.length;
    const totalPages = Math.ceil(totalCount / paginationOptions.limit);
    const offset = (paginationOptions.page - 1) * paginationOptions.limit;
    const items = wallets.slice(offset, offset + paginationOptions.limit);

    return {
      items,
      totalCount,
      totalPages,
      currentPage: paginationOptions.page,
    };
  }

  /**
   * Получить один программный кошелек по фильтру
   */
  async getProgramWallet(filter: ProgramWalletFilterInputDTO): Promise<ProgramWalletDomainEntity | null> {
    const coopname = config.coopname;

    // Преобразуем program_type в program_id если указан
    let program_id = filter.program_id;
    if (filter.program_type && !program_id) {
      program_id = getProgramId(filter.program_type);
    }

    // Если указаны username и program_id, ищем конкретный кошелек
    if (filter.username && program_id) {
      return await this.programWalletRepository.findByUsernameAndProgramId(filter.username, program_id);
    }

    // В остальных случаях получаем первый кошелек из списка
    const wallets = await this.getProgramWalletsFromRepository({
      coopname: filter.coopname || coopname,
      username: filter.username,
      program_id,
    });

    return wallets.length > 0 ? wallets[0] : null;
  }

  /**
   * Вспомогательный метод для получения кошельков из репозитория
   * Используется другими модулями для доступа к данным кошелька
   */
  private async getProgramWalletsFromRepository(filter: {
    coopname: string;
    username?: string;
    program_id?: string;
  }): Promise<ProgramWalletDomainEntity[]> {
    // Если указан фильтр по пользователю и программе, ищем конкретный кошелек
    if (filter.username && filter.program_id) {
      const wallet = await this.programWalletRepository.findByUsernameAndProgramId(filter.username, filter.program_id);
      return wallet ? [wallet] : [];
    }

    // Если указан только фильтр по пользователю
    if (filter.username) {
      return await this.programWalletRepository.findByUsername(filter.username);
    }

    // Если указан только фильтр по программе
    if (filter.program_id) {
      return await this.programWalletRepository.findByProgramId(filter.program_id);
    }

    // Если фильтры не указаны, возвращаем все кошельки кооператива
    return await this.programWalletRepository.findByCoopname(filter.coopname);
  }
}
