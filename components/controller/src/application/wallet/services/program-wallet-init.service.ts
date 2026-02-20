import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { WalletBlockchainPort, WALLET_BLOCKCHAIN_PORT } from '~/domain/wallet/ports/wallet-blockchain.port';
import { ProgramWalletRepository, PROGRAM_WALLET_REPOSITORY } from '~/domain/wallet/repositories/program-wallet.repository';
import { config } from '~/config';

/**
 * Сервис инициализации программных кошельков
 *
 * Выполняет первоначальную загрузку всех кошельков из блокчейна при старте приложения
 * Работает асинхронно, не блокируя основной поток приложения
 */
@Injectable()
export class ProgramWalletInitService implements OnModuleInit {
  private isInitialized = false;

  constructor(
    @Inject(WALLET_BLOCKCHAIN_PORT)
    private readonly walletBlockchainPort: WalletBlockchainPort,
    @Inject(PROGRAM_WALLET_REPOSITORY)
    private readonly programWalletRepository: ProgramWalletRepository,
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(ProgramWalletInitService.name);
  }

  async onModuleInit() {
    // Запускаем инициализацию асинхронно, не блокируя старт приложения
    this.initializeProgramWallets().catch((error) => {
      this.logger.error(`Ошибка при инициализации программных кошельков: ${error.message}`, error.stack);
    });
  }

  /**
   * Инициализация программных кошельков
   * Загружает все кошельки из блокчейна и сохраняет их в базу данных
   */
  private async initializeProgramWallets(): Promise<void> {
    if (this.isInitialized) {
      this.logger.debug('Программные кошельки уже инициализированы');
      return;
    }

    try {
      this.logger.log('Начало инициализации программных кошельков...');

      const coopname = config.coopname;
      if (!coopname) {
        this.logger.warn('Не указано имя кооператива в конфигурации. Пропускаем инициализацию кошельков.');
        return;
      }

      // Извлекаем все кошельки из блокчейна
      const blockchainWallets = await this.walletBlockchainPort.getProgramWallets(coopname);

      this.logger.log(`Извлечено ${blockchainWallets.length} программных кошельков из блокчейна`);

      // Счетчики для отчета
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      // Сохраняем или обновляем каждый кошелек в базе данных
      for (const walletData of blockchainWallets) {
        try {
          // Проверяем, существует ли кошелек в базе
          const existingWallet = await this.programWalletRepository.findBySyncKey('id', walletData.id);

          if (existingWallet) {
            // Обновляем существующий кошелек
            existingWallet.updateFromBlockchain(walletData, 0, true);
            await this.programWalletRepository.update(existingWallet);
            updatedCount++;
          } else {
            // Создаем новый кошелек
            await this.programWalletRepository.createIfNotExists(walletData, 0, true);
            createdCount++;
          }
        } catch (error: any) {
          this.logger.warn(
            `Предупреждение: нулевое значение blocked для кошелька ${walletData.id} (${walletData.username}), использовано значение по умолчанию '0'`,
            error.stack
          );
          skippedCount++;
        }
      }

      this.logger.log(
        `Инициализация программных кошельков завершена: создано ${createdCount}, обновлено ${updatedCount}, пропущено ${skippedCount}`
      );

      this.isInitialized = true;
    } catch (error: any) {
      this.logger.error(`Критическая ошибка при инициализации программных кошельков: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Получить статус инициализации
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}
