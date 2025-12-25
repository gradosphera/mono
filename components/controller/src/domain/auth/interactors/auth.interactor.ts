import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { RegisteredAccountDomainInterface } from '~/domain/account/interfaces/registeted-account.interface';
import { AccountDomainService } from '~/domain/account/services/account-domain.service';
import { AuthDomainService } from '../services/auth-domain.service';
import { tokenService, userService } from '~/services';
import { BLOCKCHAIN_PORT, BlockchainPort } from '~/domain/common/ports/blockchain.port';
import type { LoginInputDomainInterface } from '../interfaces/login-input-domain.interface';
import type { StartResetKeyInputDomainInterface } from '../interfaces/start-reset-key-input.interface';
import type { ResetKeyInputDomainInterface } from '../interfaces/reset-key-input.interface';
import type { RefreshInputDomainInterface } from '../interfaces/refresh-input.interface';
import type { LogoutInputDomainInterface } from '../interfaces/logout-input-domain.interface';
import { tokenTypes } from '~/config/tokens';
import { Token } from '~/models';
import config from '~/config/config';
import { NotificationSenderService } from '~/application/notification/services/notification-sender.service';
import { Workflows } from '@coopenomics/notifications';

@Injectable()
export class AuthDomainInteractor {
  constructor(
    private readonly accountDomainService: AccountDomainService,
    private readonly notificationSenderService: NotificationSenderService,
    private readonly authDomainService: AuthDomainService,
    @Inject(BLOCKCHAIN_PORT) private readonly blockchainPort: BlockchainPort
  ) {}

  async login(data: LoginInputDomainInterface): Promise<RegisteredAccountDomainInterface> {
    const user = await this.authDomainService.loginUserWithSignature(data.email, data.now, data.signature);

    const tokens = await tokenService.generateAuthTokens(user);
    const account = await this.accountDomainService.getAccount(user.username);

    return {
      account,
      tokens,
    };
  }

  async logout(data: LogoutInputDomainInterface): Promise<void> {
    const refreshTokenDoc = await Token.findOne({ token: data.refresh_token, type: tokenTypes.REFRESH, blacklisted: false });
    if (refreshTokenDoc) {
      await refreshTokenDoc.deleteOne();
    }

    const accessTokenDoc = await Token.findOne({ token: data.access_token, type: tokenTypes.REFRESH, blacklisted: false });
    if (accessTokenDoc) {
      await accessTokenDoc.deleteOne();
    }
  }

  async startResetKey(data: StartResetKeyInputDomainInterface): Promise<void> {
    const resetKeyToken = await tokenService.generateResetKeyToken(data.email);
    const user = await userService.getUserByEmail(data.email);

    if (!user) {
      throw new Error('User not found');
    }

    const resetUrl = `${config.base_url}/${config.coopname}/auth/reset-key?token=${resetKeyToken}`;

    await this.notificationSenderService.sendNotificationToUser(user.username, Workflows.ResetKey.id, { resetUrl });
  }

  async sendVerificationEmail(username: string): Promise<void> {
    const user = await userService.getUserByUsername(username);
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
    const verificationUrl = `${config.base_url}/${config.coopname}/auth/verify-email?token=${verifyEmailToken}`;

    await this.notificationSenderService.sendNotificationToUser(user.username, Workflows.EmailVerification.id, {
      verificationUrl,
    });
  }

  async resetKey(data: ResetKeyInputDomainInterface): Promise<void> {
    try {
      const resetKeyTokenDoc = await tokenService.verifyToken(data.token, [tokenTypes.RESET_KEY, tokenTypes.INVITE]);

      const user = await userService.getUserById(resetKeyTokenDoc.user);
      if (!user) {
        throw new Error();
      }

      await this.blockchainPort.changeKey({
        coopname: config.coopname,
        changer: config.coopname,
        username: user.username,
        public_key: data.public_key,
      });

      await userService.updateUserById(user._id, { public_key: data.public_key });

      await Token.deleteMany({ user: user._id, type: tokenTypes.RESET_KEY });
    } catch (error) {
      throw new UnauthorizedException('Возникла ошибка при сбросе ключа');
    }
  }

  async refresh(data: RefreshInputDomainInterface): Promise<RegisteredAccountDomainInterface> {
    try {
      const refreshTokenDoc = await tokenService.verifyToken(data.refresh_token, tokenTypes.REFRESH);
      const user = await userService.getUserById(refreshTokenDoc.user);

      if (!user) {
        throw new Error();
      }

      await refreshTokenDoc.deleteOne();
      const tokens = await tokenService.generateAuthTokens(user);

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
