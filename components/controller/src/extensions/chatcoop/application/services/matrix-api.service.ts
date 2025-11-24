import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import config from '~/config/config';

interface MatrixLoginResponse {
  user_id: string;
  access_token: string;
  device_id: string;
  home_server: string;
}

interface MatrixRegisterResponse {
  user_id: string;
  access_token: string;
  device_id: string;
  home_server: string;
  matrix_username?: string; // Добавляем поле для сгенерированного username
}

interface CreateRoomResponse {
  room_id: string;
}

interface RoomInfo {
  room_id: string;
  name: string;
  canonical_alias?: string;
  joined_members: number;
  room_type?: string;
}

interface RoomsSearchResponse {
  rooms: RoomInfo[];
  offset: number;
  total_rooms: number;
}

interface RoomMembersResponse {
  members: string[];
  total: number;
}

@Injectable()
export class MatrixApiService {
  private readonly logger = new Logger(MatrixApiService.name);
  private readonly homeserverUrl: string;
  private readonly adminUsername: string;
  private readonly adminPassword: string;
  private adminAccessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.homeserverUrl = config.matrix.homeserver_url;
    this.adminUsername = config.matrix.admin_username;
    this.adminPassword = config.matrix.admin_password;
    this.httpClient = axios.create({
      baseURL: this.homeserverUrl,
      timeout: 10000,
    });
  }

  async loginAdmin(): Promise<string> {
    try {
      // Проверяем, действителен ли текущий токен
      if (this.adminAccessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        if (!this.adminAccessToken) {
          throw new Error('Admin access token is null');
        }
        return this.adminAccessToken;
      }

      const response = await this.httpClient.post<MatrixLoginResponse>('/_matrix/client/r0/login', {
        type: 'm.login.password',
        user: this.adminUsername,
        password: this.adminPassword,
      });

      this.adminAccessToken = response.data.access_token;
      // Токен Matrix обычно действителен долго, но будем обновлять каждые 24 часа для безопасности
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      this.logger.log('Администратор успешно вошел в Matrix');
      return this.adminAccessToken;
    } catch (error: any) {
      this.logger.error(`Не удалось войти администратору в Matrix: ${JSON.stringify(error?.response?.data)}`);
      throw new Error('Не удалось войти в Matrix как администратор');
    }
  }

  async registerUser(
    username: string,
    password: string,
    coopUsername: string,
    email?: string,
    displayName?: string,
    phone?: string,
    admin = false
  ): Promise<MatrixRegisterResponse> {
    try {
      this.logger.debug(`Регистрация пользователя Matrix: ${username}, email: ${email}, отображаемое имя: ${displayName}`);

      // Получаем admin токен
      const adminToken = await this.loginAdmin();

      // Проверяем существование пользователя по email, если email указан
      if (email) {
        const emailExists = await this.checkEmailExists(email);
        if (emailExists) {
          throw new Error('MATRIX_EMAIL_EXISTS');
        }
      }

      // Проверяем существование пользователя по username
      const checkUserId = `@${username}:${this.homeserverUrl.replace('https://', '').replace('http://', '')}`;

      // Пытаемся получить информацию о пользователе
      try {
        await this.httpClient.get(`/_synapse/admin/v2/users/${encodeURIComponent(checkUserId)}`, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });
        // Если дошли сюда - пользователь уже существует
        throw new Error('MATRIX_USERNAME_EXISTS');
      } catch (error: any) {
        if (error.response?.status !== 404) {
          // Если ошибка не "не найден" - пробрасываем дальше
          throw error;
        }
        // 404 - пользователь не существует, можно создавать
      }

      // Формируем user_id в формате @username:server
      const userId = `@${username}:${this.homeserverUrl.replace('https://', '').replace('http://', '')}`;

      // Подготавливаем данные для создания пользователя
      const userData: any = {
        password,
        admin,
        deactivated: false,
        locked: false,
        external_ids: [
          {
            auth_provider: 'coopenomics',
            external_id: `${config.coopname}:${coopUsername}:${username}`,
          },
        ],
      };

      // Добавляем display name если указан
      if (displayName) {
        userData.displayname = displayName;
      }

      // Добавляем email и телефон если они предоставлены
      const threepids: Array<{ medium: 'email' | 'msisdn'; address: string }> = [];

      if (email) {
        threepids.push({
          medium: 'email',
          address: email,
        });
      }

      if (phone) {
        // Для телефона используем формат msisdn (MSISDN - Mobile Station International Subscriber Directory Number)
        threepids.push({
          medium: 'msisdn',
          address: phone.replace(/\D/g, ''), // Убираем все нецифровые символы
        });
      }

      if (threepids.length > 0) {
        userData.threepids = threepids;
      }

      // Создаем пользователя через Admin API v2
      const response = await this.httpClient.put<MatrixRegisterResponse>(
        `/_synapse/admin/v2/users/${encodeURIComponent(userId)}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      this.logger.debug(`Ответ регистрации пользователя: ${JSON.stringify(response.data)}`);

      // Добавляем username в ответ для обратной совместимости
      const result = {
        ...response.data,
        matrix_username: username,
        user_id: userId,
      };

      this.logger.log(`Пользователь ${username} успешно зарегистрирован в Matrix`);
      return result;
    } catch (error: any) {
      this.logger.error(`Ошибка при регистрации пользователя: ${JSON.stringify((error as any)?.response?.data)}`);
      const errorMessage = error instanceof Error ? error.message : String((error as any)?.response?.data?.error);
      this.logger.error(`Не удалось зарегистрировать пользователя ${username} в Matrix: ${errorMessage}`);
      throw new Error('Не удалось зарегистрировать пользователя в Matrix');
    }
  }

  async loginUser(username: string, password: string): Promise<MatrixLoginResponse> {
    try {
      const response = await this.httpClient.post<MatrixLoginResponse>('/_matrix/client/r0/login', {
        type: 'm.login.password',
        user: username,
        password: password,
      });
      this.logger.debug(`Результат входа в систему: ${JSON.stringify(response.data)}`);
      this.logger.log(`Пользователь ${username} успешно вошел в Matrix`);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Не удалось войти пользователю ${username} в Matrix: ${JSON.stringify(error?.response?.data)}`);
      throw new Error('Не удалось войти в Matrix');
    }
  }
  /**
   * Ищет пользователя в Synapse по email
   */
  async findUserByEmail(email: string): Promise<{ user_id: string; name: string } | null> {
    try {
      const adminToken = await this.loginAdmin();
      this.logger.debug(`Поиск пользователя по email: ${email}`);
      // Ищем пользователя по email в threepids согласно официальной документации
      const response = await this.httpClient.get(`/_synapse/admin/v1/threepid/email/users/${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      this.logger.debug(`Ответ findUserByEmail: ${JSON.stringify(response.data)}`);

      // Если threepid найден, получаем информацию о пользователе
      if (response.data && response.data.user_id) {
        // Извлекаем username из user_id
        const userId = response.data.user_id;
        const username = userId.split(':')[0].substring(1); // Убираем @ и :domain

        return {
          user_id: userId,
          name: username,
        };
      }

      return null;
    } catch (error: any) {
      this.logger.debug(`Ошибка findUserByEmail: ${JSON.stringify(error?.response?.data) || error.message}`);

      // Проверяем, является ли ошибка 404 (пользователь не найден)
      if (error?.response?.status === 404) {
        this.logger.debug(`findUserByEmail: Пользователь не найден для email ${email}`);
        return null;
      }

      // Если другая ошибка - возвращаем null
      return null;
    }
  }

  /**
   * Проверяет доступность username в Matrix
   */
  async checkUsernameAvailability(username: string): Promise<boolean> {
    try {
      const adminToken = await this.loginAdmin();
      const userId = `@${username}:${this.homeserverUrl.replace('https://', '').replace('http://', '')}`;

      // Пытаемся получить информацию о пользователе
      await this.httpClient.get(`/_synapse/admin/v2/users/${encodeURIComponent(userId)}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      // Если запрос прошел успешно - пользователь существует
      return false; // Недоступен
    } catch (error: any) {
      // Если 404 - пользователь не существует, значит доступен
      if (error.response?.status === 404) {
        return true; // Доступен
      }
      // При других ошибках считаем недоступным
      return false;
    }
  }

  /**
   * Проверяет существование пользователя по email
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const adminToken = await this.loginAdmin();

      // Ищем threepid по email
      const response = await this.httpClient.get(
        `/_synapse/admin/v1/threepid/unbind?address=${encodeURIComponent(email)}&id_server=matrix.org&medium=email`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      // Если threepid найден - email уже используется
      return response.data && response.data.user_id;
    } catch (error: any) {
      // Если threepid не найден - email свободен
      return false;
    }
  }

  getHomeserverUrl(): string {
    return this.homeserverUrl;
  }

  /**
   * Возвращает user_id администратора Matrix
   */
  getAdminUserId(): string {
    return `@${this.adminUsername}:${this.homeserverUrl.replace('https://', '').replace('http://', '')}`;
  }

  /**
   * Создает новую комнату в Matrix
   */
  async createRoom(
    name: string,
    topic?: string,
    isPrivate = true,
    roomType?: string,
    initialState?: any[],
    encrypt = true,
    powerLevels?: any
  ): Promise<string> {
    try {
      const adminToken = await this.loginAdmin();

      const roomConfig: any = {
        name,
        preset: isPrivate ? 'private_chat' : 'public_chat',
        visibility: isPrivate ? 'private' : 'public',
      };

      if (topic) {
        roomConfig.topic = topic;
      }

      if (roomType) {
        roomConfig.creation_content = {
          type: roomType,
        };
      }

      // Подготавливаем initial_state
      const finalInitialState = initialState ? [...initialState] : [];

      if (powerLevels) {
        roomConfig.power_level_content_override = powerLevels;
        finalInitialState.push({
          type: 'm.room.power_levels',
          state_key: '',
          content: powerLevels,
        });
      }

      // Для приватных комнат включаем сквозное шифрование, если encrypt = true
      if (isPrivate && encrypt) {
        finalInitialState.push({
          type: 'm.room.encryption',
          state_key: '',
          content: {
            algorithm: 'm.megolm.v1.aes-sha2',
          },
        });
      }

      if (finalInitialState.length > 0) {
        roomConfig.initial_state = finalInitialState;
      }

      const response = await this.httpClient.post<CreateRoomResponse>('/_matrix/client/v3/createRoom', roomConfig, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      this.logger.log(`Комната "${name}" успешно создана с ID: ${response.data.room_id}`);
      return response.data.room_id;
    } catch (error: any) {
      this.logger.error(`Не удалось создать комнату "${name}": ${JSON.stringify(error?.response?.data)}`);
      throw new Error('Не удалось создать комнату в Matrix');
    }
  }

  /**
   * Создает пространство (space) в Matrix
   */
  async createSpace(name: string, topic?: string): Promise<string> {
    return this.createRoom(name, topic, true, 'm.space', [
      {
        type: 'm.room.history_visibility',
        state_key: '',
        content: {
          history_visibility: 'invited',
        },
      },
    ]);
  }

  /**
   * Ищет комнаты по имени
   */
  async searchRooms(searchTerm: string): Promise<RoomInfo[]> {
    try {
      const adminToken = await this.loginAdmin();

      const response = await this.httpClient.get<RoomsSearchResponse>(
        `/_synapse/admin/v1/rooms?search_term=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return response.data.rooms;
    } catch (error: any) {
      this.logger.error(`Не удалось найти комнаты с термином "${searchTerm}": ${JSON.stringify(error?.response?.data)}`);
      return [];
    }
  }

  /**
   * Получает информацию о комнате
   */
  async getRoomInfo(roomId: string): Promise<RoomInfo | null> {
    try {
      const adminToken = await this.loginAdmin();

      const response = await this.httpClient.get<RoomInfo>(`/_synapse/admin/v1/rooms/${encodeURIComponent(roomId)}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      // Если комната не найдена, возвращаем null
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error(`Не удалось получить информацию о комнате ${roomId}: ${JSON.stringify(error?.response?.data)}`);
      throw error;
    }
  }

  /**
   * Получает список участников комнаты
   */
  async getRoomMembers(roomId: string): Promise<string[]> {
    try {
      const adminToken = await this.loginAdmin();

      const response = await this.httpClient.get<RoomMembersResponse>(
        `/_synapse/admin/v1/rooms/${encodeURIComponent(roomId)}/members`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return response.data.members;
    } catch (error: any) {
      this.logger.error(`Не удалось получить участников комнаты ${roomId}: ${JSON.stringify(error?.response?.data)}`);
      return [];
    }
  }

  /**
   * Присоединяет пользователя к комнате
   */
  async joinRoom(userId: string, roomId: string): Promise<void> {
    try {
      const adminToken = await this.loginAdmin();

      await this.httpClient.post(
        `/_synapse/admin/v1/join/${encodeURIComponent(roomId)}`,
        { user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      this.logger.log(`Пользователь ${userId} присоединился к комнате ${roomId}`);
    } catch (error: any) {
      this.logger.error(
        `Не удалось присоединить пользователя ${userId} к комнате ${roomId}: ${JSON.stringify(error?.response?.data)}`
      );
      throw new Error('Не удалось присоединить пользователя к комнате');
    }
  }

  /**
   * Получает текущие права пользователей в комнате
   */
  async getRoomPowerLevels(roomId: string): Promise<any> {
    try {
      const adminToken = await this.loginAdmin();

      const response = await this.httpClient.get(
        `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state/m.room.power_levels`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`Не удалось получить права комнаты ${roomId}: ${JSON.stringify(error?.response?.data)}`);
      return null;
    }
  }

  /**
   * Обновляет права пользователей в комнате
   */
  async updateRoomPowerLevels(roomId: string, powerLevels: any): Promise<void> {
    try {
      const adminToken = await this.loginAdmin();

      await this.httpClient.put(
        `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state/m.room.power_levels`,
        powerLevels,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      this.logger.log(`Права в комнате ${roomId} обновлены`);
    } catch (error: any) {
      this.logger.error(`Не удалось обновить права в комнате ${roomId}: ${JSON.stringify(error?.response?.data)}`);
      throw new Error('Не удалось обновить права в комнате');
    }
  }

  /**
   * Добавляет комнату в пространство
   */
  async addRoomToSpace(spaceId: string, roomId: string): Promise<void> {
    try {
      const adminToken = await this.loginAdmin();

      await this.httpClient.put(
        `/_matrix/client/v3/rooms/${encodeURIComponent(spaceId)}/state/m.space.child/${encodeURIComponent(roomId)}`,
        {
          via: [this.homeserverUrl.replace('https://', '').replace('http://', '')],
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      this.logger.log(`Комната ${roomId} добавлена в пространство ${spaceId}`);
    } catch (error: any) {
      this.logger.error(
        `Не удалось добавить комнату ${roomId} в пространство ${spaceId}: ${JSON.stringify(error?.response?.data)}`
      );
      throw new Error('Не удалось добавить комнату в пространство');
    }
  }
}
