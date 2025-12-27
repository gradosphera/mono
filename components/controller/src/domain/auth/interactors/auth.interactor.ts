import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { RegisteredAccountDomainInterface } from '~/domain/account/interfaces/registeted-account.interface';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { AuthDomainService } from '../services/auth-domain.service';
import { UserDomainService, USER_DOMAIN_SERVICE } from '~/domain/user/services/user-domain.service';
import { TokenApplicationService } from '~/application/token/services/token-application.service';
import { BLOCKCHAIN_PORT, BlockchainPort } from '~/domain/common/ports/blockchain.port';
import type { LoginInputDomainInterface } from '../interfaces/login-input-domain.interface';
import type { StartResetKeyInputDomainInterface } from '../interfaces/start-reset-key-input.interface';
import type { ResetKeyInputDomainInterface } from '../interfaces/reset-key-input.interface';
import type { RefreshInputDomainInterface } from '../interfaces/refresh-input.interface';
import type { LogoutInputDomainInterface } from '../interfaces/logout-input-domain.interface';
import { tokenTypes } from '~/types/token.types';
import config from '~/config/config';
import { NotificationSenderService } from '~/application/notification/services/notification-sender.service';
import { Workflows } from '@coopenomics/notifications';

@Injectable()
export class AuthDomainInteractor {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    private readonly notificationSenderService: NotificationSenderService,
    private readonly authDomainService: AuthDomainService,
    private readonly tokenApplicationService: TokenApplicationService,
    @Inject(BLOCKCHAIN_PORT) private readonly blockchainPort: BlockchainPort,
    @Inject(USER_DOMAIN_SERVICE) private readonly userDomainService: UserDomainService
  ) {}

  async login(data: LoginInputDomainInterface): Promise<RegisteredAccountDomainInterface> {
    const user = await this.authDomainService.loginUserWithSignature(data.email, data.now, data.signature);

    const tokens = await this.tokenApplicationService.generateAuthTokens(user.id);
    const account = await this.accountDomainService.getAccount(user.username);

    return {
      account,
      tokens,
    };
  }

  async logout(data: LogoutInputDomainInterface): Promise<void> {
    // Удаляем refresh токен
    if (data.refresh_token) {
      await this.tokenApplicationService.findOneAndDelete(data.refresh_token, tokenTypes.REFRESH);
    }

    // Удаляем access токен (если он передан)
    if (data.access_token) {
      await this.tokenApplicationService.findOneAndDelete(data.access_token, tokenTypes.ACCESS);
    }
  }

  async startResetKey(data: StartResetKeyInputDomainInterface): Promise<void> {
    const user = await this.userDomainService.getUserByEmail(data.email);
    if (!user) {
      throw new Error('User not found');
    }
    const resetKeyToken = await this.tokenApplicationService.generateResetKeyToken(data.email, user.id);

    if (!user) {
      throw new Error('User not found');
    }

    const resetUrl = `${config.base_url}/${config.coopname}/auth/reset-key?token=${resetKeyToken}`;

    await this.notificationSenderService.sendNotificationToUser(user.username, Workflows.ResetKey.id, { resetUrl });
  }

  async sendVerificationEmail(username: string): Promise<void> {
    const user = await this.userDomainService.getUserByUsername(username);
    const verifyEmailToken = await this.tokenApplicationService.generateVerifyEmailToken(user.id);
    const verificationUrl = `${config.base_url}/${config.coopname}/auth/verify-email?token=${verifyEmailToken}`;

    await this.notificationSenderService.sendNotificationToUser(user.username, Workflows.EmailVerification.id, {
      verificationUrl,
    });
  }

  async resetKey(data: ResetKeyInputDomainInterface): Promise<void> {
    try {
      const resetKeyTokenDoc = await this.tokenApplicationService.verifyToken({
        token: data.token,
        types: [tokenTypes.RESET_KEY, tokenTypes.INVITE],
      });

      const user = await this.userDomainService.getUserByLegacyMongoId(resetKeyTokenDoc.userId);
      if (!user) {
        throw new Error();
      }

      await this.blockchainPort.changeKey({
        coopname: config.coopname,
        changer: config.coopname,
        username: user.username,
        public_key: data.public_key,
      });

      await this.userDomainService.updateUserById(user.id, { public_key: data.public_key });

      await this.tokenApplicationService.deleteTokens({ userId: user.id, type: tokenTypes.RESET_KEY });
    } catch (error) {
      throw new UnauthorizedException('Возникла ошибка при сбросе ключа');
    }
  }

  async refresh(data: RefreshInputDomainInterface): Promise<RegisteredAccountDomainInterface> {
    try {
      const refreshTokenDoc = await this.tokenApplicationService.verifyToken({
        token: data.refresh_token,
        types: [tokenTypes.REFRESH],
      });
      const user = await this.userDomainService.getUserByLegacyMongoId(refreshTokenDoc.userId);

      if (!user) {
        throw new Error();
      }

      await this.tokenApplicationService.findOneAndDelete(data.refresh_token, tokenTypes.REFRESH);
      const tokens = await this.tokenApplicationService.generateAuthTokens(user.id);

      const account = await this.accountDomainService.getAccount(user.username);

      return {
        account,
        tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('Возникла неизвестная ошибка при обновлении');
    }
  }

  async verifyEmail(verifyEmailToken: string): Promise<void> {
    await this.authDomainService.verifyEmail(verifyEmailToken);
  }
}
