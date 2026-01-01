import { Module } from '@nestjs/common';
import { BaseExtModule } from '../base.extension.module';
import { ChatCoopDatabaseModule } from './infrastructure/database/chatcoop-database.module';
import { ChatCoopApplicationService } from './application/services/chatcoop-application.service';
import { MatrixApiService } from './application/services/matrix-api.service';
import { MatrixUserManagementService } from './domain/services/matrix-user-management.service';
import { UnionChatService } from './domain/services/union-chat.service';
import { UnionChatTypeormRepository } from './infrastructure/repositories/union-chat.typeorm-repository';
import { UNION_CHAT_REPOSITORY } from './domain/repositories/union-chat.repository';
import { ChatCoopResolver } from './application/resolvers/chatcoop.resolver';
import { Injectable, Inject } from '@nestjs/common';
import { WinstonLoggerService } from '~/application/logger/logger-app.service';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { AccountInfrastructureModule } from '~/infrastructure/account/account-infrastructure.module';
import { ExtensionDomainRepository } from '~/domain/extension/repositories/extension-domain.repository';
import { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';
import { VarsRepository, VARS_REPOSITORY } from '~/domain/common/repositories/vars.repository';
import { VarsRepositoryImplementation } from '~/infrastructure/database/generator-repositories/repositories/vars-generator.repository';
import type { DeserializedDescriptionOfExtension } from '~/types/shared';

// Функция для проверки и сериализации FieldDescription
function describeField(description: DeserializedDescriptionOfExtension): string {
  return JSON.stringify(description);
}

// Схема конфигурации для чаткооп
export const Schema = z.object({
  // ID пространства кооператива в Matrix
  spaceId: z
    .string()
    .optional()
    .describe(
      describeField({
        label: 'ID пространства кооператива',
        note: 'Matrix ID приватного пространства кооператива (заполняется автоматически)',
        visible: false,
      })
    ),

  // ID комнаты пайщиков в Matrix
  membersRoomId: z
    .string()
    .optional()
    .describe(
      describeField({
        label: 'ID комнаты пайщиков',
        note: 'Matrix ID приватной комнаты для всех пайщиков кооператива (заполняется автоматически)',
        visible: false,
      })
    ),

  // ID комнаты совета в Matrix
  councilRoomId: z
    .string()
    .optional()
    .describe(
      describeField({
        label: 'ID комнаты совета',
        note: 'Matrix ID приватной комнаты для членов совета кооператива (заполняется автоматически)',
        visible: false,
      })
    ),

  // Флаг инициализации пространства
  isInitialized: z
    .boolean()
    .default(false)
    .describe(
      describeField({
        label: 'Пространство инициализировано',
        note: 'Указывает, было ли создано пространство и комнаты для кооператива',
        visible: false,
      })
    ),
});

// Дефолтные параметры конфигурации
export const defaultConfig = {
  spaceId: undefined,
  membersRoomId: undefined,
  councilRoomId: undefined,
  isInitialized: false,
};

// Автоматическое создание типа IConfig на основе Zod-схемы
export type IConfig = z.infer<typeof Schema>;

// Репозитории
import { MatrixUserTypeormRepository } from './infrastructure/repositories/matrix-user.typeorm-repository';
import { TypeOrmExtensionDomainRepository } from '~/infrastructure/database/typeorm/repositories/typeorm-extension.repository';

// Символы для DI
import { MATRIX_USER_REPOSITORY } from './domain/repositories/matrix-user.repository';
import { EXTENSION_REPOSITORY } from '~/domain/extension/repositories/extension-domain.repository';

@Injectable()
export class ChatCoopPlugin extends BaseExtModule {
  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>,
    @Inject(VARS_REPOSITORY) private readonly varsRepository: VarsRepository,
    private readonly logger: WinstonLoggerService,
    private readonly matrixApiService: MatrixApiService,
    private readonly chatCoopApplicationService: ChatCoopApplicationService
  ) {
    super();
    this.logger.setContext(ChatCoopPlugin.name);
  }

  name = 'chatcoop';
  plugin!: ExtensionDomainEntity<IConfig>;
  configSchemas = Schema;
  defaultConfig = defaultConfig;

  async initialize(): Promise<void> {
    try {
      this.logger.log('Инициализация модуля чаткооп...');

      // Получаем конфигурацию плагина
      const pluginData = await this.extensionRepository.findByName(this.name);
      if (!pluginData) throw new Error('Конфиг чаткооп не найден');

      this.plugin = pluginData;

      // Выполняем логин администратора при инициализации
      await this.matrixApiService.loginAdmin();

      // Проверяем, нужно ли инициализировать пространство и комнаты
      if (!this.plugin.config.isInitialized) {
        await this.initializeCooperativeSpace();
      }

      this.logger.log('Модуль чаткооп успешно инициализирован');
    } catch (error) {
      this.logger.error('Не удалось инициализировать модуль чаткооп', JSON.stringify(error));
      throw error;
    }
  }

  /**
   * Инициализирует пространство и комнаты для кооператива
   */
  private async initializeCooperativeSpace(): Promise<void> {
    try {
      this.logger.log('Инициализация пространства и комнат кооператива...');

      // Получаем переменные кооператива
      const vars = await this.varsRepository.get();
      if (!vars) {
        throw new Error('Не удалось получить переменные кооператива');
      }

      const spaceName = `${vars.short_abbr} ${vars.name.toUpperCase()}`;
      const membersRoomName = `Комната пайщиков ${vars.short_abbr} ${vars.name}`;
      const councilRoomName = `Комната совета ${vars.short_abbr} ${vars.name}`;

      // Получаем user_id администратора Matrix
      const adminUserId = this.matrixApiService.getAdminUserId();

      // Базовые права для комнаты пайщиков
      // В этой комнате: члены совета (power level 50) могут создавать звонки,
      // все пайщики (power level 0) могут участвовать в звонках
      const membersRoomPowerLevels = {
        users_default: 0, // Обычные пайщики имеют уровень 0
        invite: 100, // Только администратор может приглашать (будет изменено после присоединения пользователей)
        state_default: 100, // Только администратор может менять настройки комнаты
        events_default: 0, // Все могут отправлять сообщения
        users: {
          [adminUserId]: 100, // Администратор Matrix имеет полные права
        },
        events: {
          // Настройки комнаты — только для администратора (100)
          'm.room.name': 100, // Изменение названия комнаты
          'm.room.topic': 100, // Изменение описания комнаты
          'm.room.power_levels': 100, // Изменение уровней прав
          'm.room.history_visibility': 100, // Изменение видимости истории
          'm.room.encryption': 100, // Изменение настроек шифрования
          // Звонки — создавать могут только члены совета (50), участвовать — все (0)
          'm.call.invite': 50, // Инициация звонка — только члены совета
          'm.call.answer': 0, // Ответ на звонок — все пайщики
          'm.call.hangup': 50, // Завершение звонка — только члены совета
          'm.call.candidates': 0, // WebRTC кандидаты — все участники (техническое)
        },
      };

      // Базовые права для комнаты совета
      // В этой комнате: все члены совета (power level 0) могут создавать и участвовать в звонках
      const councilRoomPowerLevels = {
        users_default: 0, // Все члены совета имеют уровень 0 (в эту комнату попадают только члены совета)
        invite: 100, // Только администратор может приглашать новых участников
        state_default: 100, // Только администратор может менять настройки комнаты
        events_default: 0, // Все могут отправлять сообщения
        users: {
          [adminUserId]: 100, // Администратор Matrix имеет полные права
        },
        events: {
          // Настройки комнаты — только для администратора (100)
          'm.room.name': 100, // Изменение названия комнаты
          'm.room.topic': 100, // Изменение описания комнаты
          'm.room.power_levels': 100, // Изменение уровней прав
          'm.room.history_visibility': 100, // Изменение видимости истории
          'm.room.encryption': 100, // Изменение настроек шифрования
          // Звонки — все члены совета могут создавать и участвовать (0)
          'm.call.invite': 0, // Инициация звонка — все члены совета
          'm.call.answer': 0, // Ответ на звонок — все члены совета
          'm.call.hangup': 0, // Завершение звонка — все члены совета
          'm.call.candidates': 0, // WebRTC кандидаты — все (техническое)
        },
      };

      // Создаем пространство кооператива
      const spaceId = await this.matrixApiService.createSpace(spaceName, `Частное пространство кооператива ${vars.name}`);
      this.logger.log(`Создано пространство кооператива: ${spaceId}`);

      // Создаем комнату для пайщиков (без шифрования)
      const membersRoomId = await this.matrixApiService.createRoom(
        membersRoomName,
        'Чат для всех пайщиков кооператива',
        true,
        undefined,
        undefined,
        true,
        membersRoomPowerLevels
      );
      this.logger.log(`Создана комната пайщиков: ${membersRoomId}`);

      // Создаем комнату для совета
      const councilRoomId = await this.matrixApiService.createRoom(
        councilRoomName,
        'Чат для членов совета кооператива',
        true,
        undefined,
        undefined,
        true,
        councilRoomPowerLevels
      );
      this.logger.log(`Создана комната совета: ${councilRoomId}`);
      this.logger.log(`Все комнаты созданы: space=${spaceId}, members=${membersRoomId}, council=${councilRoomId}`);

      // Добавляем комнаты в пространство
      await this.matrixApiService.addRoomToSpace(spaceId, membersRoomId);
      await this.matrixApiService.addRoomToSpace(spaceId, councilRoomId);

      // Сохраняем ID в конфигурации
      this.plugin.config.spaceId = spaceId as any;
      this.plugin.config.membersRoomId = membersRoomId as any;
      this.plugin.config.councilRoomId = councilRoomId as any;
      this.plugin.config.isInitialized = true as any;

      await this.extensionRepository.update(this.plugin);
      this.logger.log(
        `Конфигурация сохранена: spaceId=${this.plugin.config.spaceId}, membersRoomId=${this.plugin.config.membersRoomId}, councilRoomId=${this.plugin.config.councilRoomId}`
      );

      // Синхронизируем существующих пользователей в комнаты чаткооп
      await this.chatCoopApplicationService.syncExistingUsersToChatCoopRooms();

      this.logger.log('Пространство и комнаты кооператива успешно инициализированы');
    } catch (error) {
      this.logger.error('Не удалось инициализировать пространство и комнаты кооператива', JSON.stringify(error));
      throw error;
    }
  }
}

@Module({
  imports: [ChatCoopDatabaseModule, ConfigModule, AccountInfrastructureModule],
  providers: [
    // Plugin
    ChatCoopPlugin,

    // Application Services
    ChatCoopApplicationService,
    MatrixApiService,

    // Repositories
    {
      provide: EXTENSION_REPOSITORY,
      useClass: TypeOrmExtensionDomainRepository,
    },
    {
      provide: VARS_REPOSITORY,
      useClass: VarsRepositoryImplementation,
    },

    // Domain Services
    MatrixUserManagementService,
    UnionChatService,

    // Repositories
    {
      provide: MATRIX_USER_REPOSITORY,
      useClass: MatrixUserTypeormRepository,
    },
    {
      provide: UNION_CHAT_REPOSITORY,
      useClass: UnionChatTypeormRepository,
    },

    // GraphQL Resolvers
    ChatCoopResolver,
  ],
  exports: [ChatCoopPlugin],
})
export class ChatCoopPluginModule {
  constructor(private readonly chatcoopPlugin: ChatCoopPlugin) {}

  async initialize() {
    await this.chatcoopPlugin.initialize();
  }
}
