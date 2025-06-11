import cron from 'node-cron';
import { Inject, Injectable, Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import {
  EXTENSION_REPOSITORY,
  type ExtensionDomainRepository,
} from '~/domain/extension/repositories/extension-domain.repository';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import type { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import {
  LOG_EXTENSION_REPOSITORY,
  LogExtensionDomainRepository,
} from '~/domain/extension/repositories/log-extension-domain.repository';
import { ACCOUNT_EXTENSION_PORT, AccountExtensionPort } from '~/domain/extension/ports/account-extension-port';
import { MEET_EXTENSION_PORT, MeetExtensionPort } from '~/domain/extension/ports/meet-extension-port';
import { ExtensionPortsModule } from '~/domain/extension/extension-ports.module';
import { merge } from 'lodash';
import { IConfig, defaultConfig, Schema, ILog } from './types';
import { NotificationSenderService } from './notification-sender.service';
import { MeetTrackerService } from './meet-tracker.service';
import { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';

@Injectable()
export class ParticipantPlugin extends BaseExtModule {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    @Inject(LOG_EXTENSION_REPOSITORY) private readonly logExtensionRepository: LogExtensionDomainRepository<ILog>,
    private readonly logger: WinstonLoggerService,
    @Inject(MEET_EXTENSION_PORT) private readonly meetPort: MeetExtensionPort,
    @Inject(ACCOUNT_EXTENSION_PORT) private readonly accountPort: AccountExtensionPort,
    private readonly meetTracker: MeetTrackerService,
    private readonly notificationSender: NotificationSenderService
  ) {
    super();
    this.logger.setContext(ParticipantPlugin.name);
  }

  name = 'participant';
  plugin!: ExtensionDomainEntity<IConfig>;

  public configSchemas = Schema;
  public defaultConfig = defaultConfig;

  // Получение всех аккаунтов с использованием пакетной загрузки
  async getAllAccounts(): Promise<AccountDomainEntity[]> {
    return this.meetTracker.getAllAccounts();
  }

  // Получение всех email-адресов пользователей
  async getAllUserEmails(): Promise<string[]> {
    return this.meetTracker.getAllUserEmails();
  }

  async initialize() {
    const pluginData = await this.extensionRepository.findByName(this.name);
    if (!pluginData) throw new Error('Конфиг не найден');

    // Применяем глубокий мердж дефолтных параметров с существующими
    this.plugin = {
      ...pluginData,
      config: merge({}, defaultConfig, pluginData.config),
    };

    // Убедимся, что у всех собраний есть поле restartNotification
    for (const meet of this.plugin.config.trackedMeets) {
      if (meet.notifications.restartNotification === undefined) {
        meet.notifications.restartNotification = false;
      }
    }

    this.logger.info(`Инициализация ${this.name} с конфигурацией`, this.plugin.config);

    // Настраиваем сервис отправки уведомлений
    this.notificationSender.setGetUserEmailsFunction(() => this.getAllUserEmails());

    // Инициализируем трекер собраний
    await this.meetTracker.initialize(this.plugin);

    // Запускаем проверку сразу при инициализации
    await this.meetTracker.checkMeets();

    // Регистрация cron-задачи для проверки собраний
    const cronExpression = `*/${this.plugin.config.checkIntervalMinutes} * * * *`;
    cron.schedule(cronExpression, () => {
      this.meetTracker.checkMeets();
    });
  }
}

@Module({
  imports: [
    ExtensionPortsModule, // Импортируем только модуль с портами вместо всего ExtensionDomainModule
  ],
  providers: [NotificationSenderService, MeetTrackerService, ParticipantPlugin],
  exports: [ParticipantPlugin],
})
export class ParticipantPluginModule {
  constructor(private readonly participantPlugin: ParticipantPlugin) {}

  async initialize() {
    await this.participantPlugin.initialize();
  }
}
