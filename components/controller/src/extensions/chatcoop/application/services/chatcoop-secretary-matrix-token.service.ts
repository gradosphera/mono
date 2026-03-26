import { Injectable, Inject, Logger } from '@nestjs/common';
import { MatrixApiService } from './matrix-api.service';
import { EXTENSION_REPOSITORY } from '~/domain/extension/repositories/extension-domain.repository';
import type { ExtensionDomainRepository } from '~/domain/extension/repositories/extension-domain.repository';
import { decrypt } from '~/utils/aes';

const CHATCOOP_EXTENSION_NAME = 'chatcoop';
const SECRETARY_TOKEN_EXPIRY_MS = 23 * 60 * 60 * 1000;

interface ChatCoopSecretaryAuthConfigSlice {
  secretaryMatrixUserId?: string;
  secretaryPassword?: string;
  secretaryPasswordEncrypted?: string;
}

/**
 * Кэшированный Matrix access token сервисного аккаунта секретаря (чтение истории комнат, отправка от имени бота).
 */
@Injectable()
export class ChatCoopSecretaryMatrixTokenService {
  private readonly logger = new Logger(ChatCoopSecretaryMatrixTokenService.name);
  private cachedToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    @Inject(EXTENSION_REPOSITORY) private readonly extensionRepository: ExtensionDomainRepository,
    private readonly matrixApiService: MatrixApiService
  ) {}

  async getAccessToken(): Promise<string | null> {
    if (this.cachedToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.cachedToken;
    }

    const plugin = await this.extensionRepository.findByName(CHATCOOP_EXTENSION_NAME);
    if (!plugin?.config) {
      return null;
    }
    const cfg = plugin.config as ChatCoopSecretaryAuthConfigSlice;
    const encryptedPassword = cfg.secretaryPasswordEncrypted ?? cfg.secretaryPassword;
    if (!cfg.secretaryMatrixUserId || !encryptedPassword) {
      return null;
    }

    try {
      const password = decrypt(encryptedPassword);
      const username = String(cfg.secretaryMatrixUserId).replace(/^@/, '').split(':')[0];
      const loginResponse = await this.matrixApiService.loginUser(username, password);
      this.cachedToken = loginResponse.access_token;
      this.tokenExpiry = new Date(Date.now() + SECRETARY_TOKEN_EXPIRY_MS);
      return this.cachedToken;
    } catch (error) {
      this.logger.warn(`Не удалось войти секретарём в Matrix: ${error}`);
      return null;
    }
  }
}
