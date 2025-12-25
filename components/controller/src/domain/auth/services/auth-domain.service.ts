import { Injectable, Inject } from '@nestjs/common';
import httpStatus from 'http-status';
import * as tokenService from '~/services/token.service';
import * as userService from '~/services/user.service';
import Token from '~/models/token.model';
import ApiError from '~/utils/ApiError';
import { tokenTypes } from '~/config/tokens';
import { getUserByEmail } from '~/services/user.service';
import { Bytes, Checksum256, Signature } from '@wharfkit/antelope';
import { BLOCKCHAIN_PORT, BlockchainPort } from '~/domain/common/ports/blockchain.port';

@Injectable()
export class AuthDomainService {
  constructor(@Inject(BLOCKCHAIN_PORT) private readonly blockchainPort: BlockchainPort) {}
  async loginUserWithSignature(email: string, now: string, signature: string) {
    const user = await getUserByEmail(email);

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Пользователь не найден');
    }

    const bytes = Bytes.fromString(now, 'utf8');
    const checksum = Checksum256.hash(bytes);
    const wharf_signature = Signature.from(signature);
    const publicKey = wharf_signature.recoverDigest(checksum);

    const info = await this.blockchainPort.getInfo();
    const blockchainDate = new Date(info.head_block_time).getTime();
    const userData = new Date(now).getTime();

    const differenceInSeconds = (blockchainDate - userData) / 1000;

    if (differenceInSeconds > 30) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Время подписи и время блокчейна превышает допустимое расхождение');
    }

    if (user.is_registered) {
      try {
        const blockchainAccount = await this.blockchainPort.getAccount(user.username);

        const hasKey = this.blockchainPort.hasActiveKey(blockchainAccount, publicKey.toLegacyString());
        if (!hasKey) throw new ApiError(httpStatus.UNAUTHORIZED, 'Неверный приватный ключ');
      } catch (e) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Неверный приватный ключ');
      }
    } else {
      //если пользователь еще не зарегистрирован в блокчейне, то проверяем временный ключ, который установлен в объекте его аккаунта
      if (user.public_key != publicKey.toString()) throw new ApiError(httpStatus.UNAUTHORIZED, 'Неверный приватный ключ');
    }

    return user;
  }

  async verifyEmail(verifyEmailToken: string) {
    try {
      const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
      const user = await userService.getUserById(verifyEmailTokenDoc.user);
      if (!user) {
        throw new Error();
      }
      await Token.deleteMany({ user: user._id, type: tokenTypes.VERIFY_EMAIL });
      await userService.updateUserById(user._id, { is_email_verified: true });
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
    }
  }
}
