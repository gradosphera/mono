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

      this.logger.log('Admin logged in to Matrix successfully');
      return this.adminAccessToken;
    } catch (error) {
      this.logger.error('Failed to login admin to Matrix', error);
      throw new Error('Не удалось войти в Matrix как администратор');
    }
  }

  async registerUser(username: string, password: string): Promise<MatrixRegisterResponse> {
    try {
      const adminToken = await this.loginAdmin();

      const response = await this.httpClient.post<MatrixRegisterResponse>(
        '/_matrix/client/r0/register',
        {
          username,
          password,
          auth: {
            type: 'm.login.password',
            user: this.adminUsername,
            password: this.adminPassword,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      this.logger.log(`User ${username} registered in Matrix successfully`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to register user ${username} in Matrix`, error);
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

      this.logger.log(`User ${username} logged in to Matrix successfully`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to login user ${username} to Matrix`, error);
      throw new Error('Не удалось войти в Matrix');
    }
  }

  getHomeserverUrl(): string {
    return this.homeserverUrl;
  }
}
