import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MatrixUserManagementService } from '../../domain/services/matrix-user-management.service';
import { MatrixApiService } from './matrix-api.service';
import { MatrixAccountStatusResponseDTO } from '../dto/matrix-account-status.dto';
import { AccountExtensionPort, ACCOUNT_EXTENSION_PORT } from '~/domain/extension/ports/account-extension-port';
import { VarsRepository, VARS_REPOSITORY } from '~/domain/common/repositories/vars.repository';
import { AccountDomainEntity } from '~/domain/account/entities/account-domain.entity';
import {
  ExtensionDomainRepository,
  EXTENSION_REPOSITORY,
} from '~/domain/extension/repositories/extension-domain.repository';
import { IConfig } from '../../chatcoop-extension.module';
import config from '~/config/config';

// Расширяем тип config для доступа к matrix.client_url
const extendedConfig = config as typeof config & {
  matrix: typeof config.matrix & { client_url: string };
};

/**
 * Извлекает display name из данных аккаунта и информации о кооперативе
 */
function extractDisplayName(account: AccountDomainEntity, cooperativeName: string, logger: Logger): string {
  try {
    let userName = '';

    // Получаем данные из private_account
    if (account.private_account) {
      const privateData = account.private_account;

      if (privateData.type === 'individual' && privateData.individual_data) {
        // Для физического лица
        const { first_name, last_name } = privateData.individual_data;
        userName = `${first_name} ${last_name}`;
      } else if (privateData.type === 'organization' && privateData.organization_data) {
        // Для организации - используем represented_by
        const { represented_by } = privateData.organization_data;
        if (represented_by) {
          userName = `${represented_by.first_name} ${represented_by.last_name}`;
        }
      } else if (privateData.type === 'entrepreneur' && privateData.entrepreneur_data) {
        // Для ИП
        const { first_name, last_name } = privateData.entrepreneur_data;
        userName = `${first_name} ${last_name}`;
      }
    }

    if (userName && cooperativeName) {
      return `${userName} | ${cooperativeName}`;
    }

    throw new Error('Unable to extract display name: missing user data or cooperative info');
  } catch (error) {
    logger.warn(`Не удалось извлечь отображаемое имя из данных аккаунта: ${error}`);
    return account.username;
  }
}

/**
 * Извлекает контактные данные (телефон, email) из аккаунта
 */
function extractContactInfo(account: AccountDomainEntity, logger: Logger): { phone?: string; email?: string } {
  try {
    const result: { phone?: string; email?: string } = {};

    // Email из provider_account
    if (account.provider_account?.email) {
      result.email = account.provider_account.email;
    }

    // Телефон из private_account
    if (account.private_account) {
      const privateData = account.private_account;

      if (privateData.type === 'individual' && privateData.individual_data?.phone) {
        result.phone = privateData.individual_data.phone;
      } else if (privateData.type === 'organization' && privateData.organization_data?.phone) {
        result.phone = privateData.organization_data.phone;
      } else if (privateData.type === 'entrepreneur' && privateData.entrepreneur_data?.phone) {
        result.phone = privateData.entrepreneur_data.phone;
      }
    }

    return result;
  } catch (error) {
    logger.warn(`Не удалось извлечь контактную информацию из данных аккаунта: ${error}`);
    return {};
  }
}

@Injectable()
export class ChatCoopApplicationService {
  private readonly logger = new Logger(ChatCoopApplicationService.name);

  constructor(
    private readonly matrixUserManagementService: MatrixUserManagementService,
    private readonly matrixApiService: MatrixApiService,
    private readonly configService: ConfigService,
    @Inject(ACCOUNT_EXTENSION_PORT) private readonly accountExtensionPort: AccountExtensionPort,
    @Inject(VARS_REPOSITORY) private readonly varsRepository: VarsRepository,
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository<IConfig>
  ) {}

  async getMatrixAccountStatus(coopUsername: string): Promise<MatrixAccountStatusResponseDTO> {
    // Сначала проверяем локальную базу
    const matrixUser = await this.matrixUserManagementService.getMatrixUserByCoopUsername(coopUsername);

    if (matrixUser) {
      // Получаем URL Matrix клиента из конфигурации
      const matrixClientUrl = extendedConfig.matrix.client_url;

      return {
        hasAccount: true,
        matrixUsername: matrixUser.matrixUsername,
        iframeUrl: matrixClientUrl,
      };
    }

    // Если в локальной базе нет, проверяем email в Synapse
    try {
      const account = await this.accountExtensionPort.getAccount(coopUsername);
      const email = account.provider_account?.email;

      if (email) {
        const synapseUser = await this.matrixApiService.findUserByEmail(email);
        if (synapseUser) {
          // Добавляем найденного пользователя в локальную базу
          await this.matrixUserManagementService.createMatrixUser({
            coopUsername,
            matrixUserId: synapseUser.user_id,
            matrixUsername: synapseUser.name,
          });

          // Добавляем пользователя в комнаты чаткооп
          await this.addUserToChatCoopRooms(synapseUser.user_id, account);

          const matrixClientUrl = extendedConfig.matrix.client_url;
          return {
            hasAccount: true,
            matrixUsername: synapseUser.name,
            iframeUrl: matrixClientUrl,
          };
        }
      }
    } catch (error) {
      // Игнорируем ошибки проверки в Synapse, продолжаем как обычно
      this.logger.warn(`Не удалось проверить существующего пользователя в Synapse: ${error}`);
    }

    return {
      hasAccount: false,
    };
  }

  async createMatrixAccount(coopUsername: string, matrixUsername: string, password: string): Promise<boolean> {
    // Проверяем, не существует ли уже аккаунт
    const existingUser = await this.matrixUserManagementService.getMatrixUserByCoopUsername(coopUsername);
    if (existingUser) {
      throw new Error('Matrix аккаунт уже существует для данного пользователя');
    }

    // Получаем данные аккаунта и кооператива
    const [account, vars] = await Promise.all([
      this.accountExtensionPort.getAccount(coopUsername),
      this.varsRepository.get(),
    ]);

    // Извлекаем контактные данные
    const contactInfo = extractContactInfo(account, this.logger);
    const { email, phone } = contactInfo;

    // Формируем display name с названием кооператива
    if (!vars) {
      throw new Error('Unable to get cooperative information');
    }
    const cooperativeName = `${vars.short_abbr} ${vars.name}`;
    const displayName = extractDisplayName(account, cooperativeName, this.logger);

    // Используем переданное имя пользователя без суффикса кооператива
    const fullMatrixUsername = matrixUsername.toLowerCase();

    this.logger.log(`Создание Matrix аккаунта для пользователя: ${fullMatrixUsername}`);
    this.logger.log(`Отображаемое имя: ${displayName}, Email: ${email}, Телефон: ${phone}`);

    try {
      // Регистрируем пользователя в Matrix через API с email, телефоном и display name
      const registerResponse = await this.matrixApiService.registerUser(
        fullMatrixUsername,
        password,
        coopUsername,
        email,
        displayName,
        phone
      );
      this.logger.log('Пользователь Matrix успешно зарегистрирован');

      // Сохраняем информацию о пользователе
      await this.matrixUserManagementService.createMatrixUser({
        coopUsername,
        matrixUserId: registerResponse.user_id,
        matrixUsername,
      });

      // Добавляем пользователя в комнаты чаткооп
      await this.addUserToChatCoopRooms(registerResponse.user_id, account);

      return true;
    } catch (error) {
      console.error('Failed to create Matrix account:', error);
      throw new Error('Не удалось создать Matrix аккаунт');
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    return this.matrixApiService.checkUsernameAvailability(username);
  }

  /**
   * Обновляет права пользователя в комнате на основе его роли
   */
  private async updateUserPowerLevel(
    matrixUserId: string,
    roomId: string,
    userRole: string,
    roomType: 'members' | 'council'
  ): Promise<void> {
    try {
      // Получаем текущие права комнаты
      const currentPowerLevels = await this.matrixApiService.getRoomPowerLevels(roomId);
      if (!currentPowerLevels) {
        this.logger.warn(`Не удалось получить права комнаты ${roomId}, пропускаем обновление прав пользователя`);
        return;
      }

      // Определяем уровень прав для пользователя
      let powerLevel = 0;

      if (roomType === 'members') {
        // В комнате пайщиков: председатель и члены совета - 100, остальные - 0
        if (userRole === 'chairman' || userRole === 'member') {
          powerLevel = 100;
        }
      } else if (roomType === 'council') {
        // В комнате совета: председатель - 100, остальные - 0
        if (userRole === 'chairman') {
          powerLevel = 100;
        }
      }

      // Обновляем права пользователя
      const updatedPowerLevels = { ...currentPowerLevels };
      if (!updatedPowerLevels.users) {
        updatedPowerLevels.users = {};
      }
      updatedPowerLevels.users[matrixUserId] = powerLevel;

      // Если есть пользователь с правами 100, понижаем invite до 50 (чтобы могли приглашать только привилегированные пользователи)
      const hasHighPrivilegedUser = Object.values(updatedPowerLevels.users).some((level: any) => level >= 50);
      if (hasHighPrivilegedUser) {
        updatedPowerLevels.invite = 50;
      }

      await this.matrixApiService.updateRoomPowerLevels(roomId, updatedPowerLevels);
      this.logger.log(`Права пользователя ${matrixUserId} в комнате ${roomType} обновлены до уровня ${powerLevel}`);
    } catch (error) {
      this.logger.error(`Не удалось обновить права пользователя ${matrixUserId} в комнате ${roomId}: ${error}`);
    }
  }

  /**
   * Добавляет пользователя в комнаты чаткооп на основе его роли
   */
  private async addUserToChatCoopRooms(matrixUserId: string, account: AccountDomainEntity): Promise<void> {
    try {
      // Получаем конфигурацию чаткооп
      const chatcoopConfig = await this.extensionRepository.findByName('chatcoop');
      if (!chatcoopConfig || !chatcoopConfig.config.isInitialized) {
        console.warn('ChatCoop extension not initialized, skipping room assignment');
        return;
      }

      const { spaceId, membersRoomId, councilRoomId } = chatcoopConfig.config;

      // Определяем роль пользователя
      const userRole = account.provider_account?.role || 'user';
      const isCouncilMember = userRole === 'member' || userRole === 'chairman';

      // Все пользователи присоединяются к пространству
      if (spaceId) {
        await this.matrixApiService.joinRoom(matrixUserId, spaceId);
        this.logger.log(`Пользователь ${matrixUserId} присоединился к пространству ${spaceId}`);
      }

      // Все пайщики присоединяются к комнате пайщиков
      if (membersRoomId) {
        await this.matrixApiService.joinRoom(matrixUserId, membersRoomId);
        this.logger.log(`Пользователь ${matrixUserId} присоединился к комнате пайщиков ${membersRoomId}`);

        // Обновляем права пользователя в комнате пайщиков
        await this.updateUserPowerLevel(matrixUserId, membersRoomId, userRole, 'members');
      }

      // Все пайщики присоединяются к общей комнате (если указана)
      if (config.matrix.common_room_id) {
        await this.matrixApiService.joinRoom(matrixUserId, config.matrix.common_room_id);
        this.logger.log(`Пользователь ${matrixUserId} присоединился к общей комнате ${config.matrix.common_room_id}`);
      }

      // Члены совета также присоединяются к комнате совета
      if (isCouncilMember && councilRoomId) {
        await this.matrixApiService.joinRoom(matrixUserId, councilRoomId);
        this.logger.log(`Член совета ${matrixUserId} присоединился к комнате совета ${councilRoomId}`);

        // Обновляем права пользователя в комнате совета
        await this.updateUserPowerLevel(matrixUserId, councilRoomId, userRole, 'council');
      }
    } catch (error) {
      this.logger.error(`Не удалось добавить пользователя в комнаты чаткооп: ${error}`);
      // Не выбрасываем ошибку, чтобы не блокировать создание аккаунта
    }
  }
}
