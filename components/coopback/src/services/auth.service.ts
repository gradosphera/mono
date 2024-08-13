import httpStatus from 'http-status';
import * as tokenService from './token.service';
import * as userService from './user.service';
import Token from '../models/token.model';
import ApiError from '../utils/ApiError';
import { tokenTypes } from '../config/tokens';
import { IRefreshTokens } from '../types';
import { getUserByEmail } from './user.service';
import { Bytes, Checksum256, Signature } from '@wharfkit/antelope';
import { getBlockchainAccount, getBlockchainInfo, hasActiveKey } from '../services/blockchain.service';
import config from '../config/config';
import { blockchainService } from '.';

export const loginUserWithSignature = async (email, now, signature) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Пользователь не найден');
  }

  const bytes = Bytes.fromString(now, 'utf8');
  const checksum = Checksum256.hash(bytes);
  const wharf_signature = Signature.from(signature);
  const publicKey = wharf_signature.recoverDigest(checksum).toLegacyString();

  const info = await getBlockchainInfo();
  const blockchainDate = new Date(info.head_block_time).getTime();
  const userData = new Date(now).getTime();

  const differenceInSeconds = (blockchainDate - userData) / 1000;

  if (differenceInSeconds > 30) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Время подписи и время блокчейна превышает допустимое расхождение');
  }

  if (config.env !== 'test') {
    try {
      const blockchainAccount = await getBlockchainAccount(user.username);

      const hasKey = hasActiveKey(blockchainAccount, publicKey);

      if (!hasKey) throw new ApiError(httpStatus.UNAUTHORIZED, 'Неверный приватный ключ');
    } catch (e) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Неверный приватный ключ');
    }
  }

  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
export const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.deleteOne();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
export const refreshAuth = async (data: IRefreshTokens) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(data.refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.deleteOne();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset key
 * @param {string} resetKeyToken
 * @param {string} publicKey
 * @returns {Promise}
 */
export const resetKey = async (resetKeyToken, publicKey) => {
  try {
    const resetKeyTokenDoc = await tokenService.verifyToken(resetKeyToken, tokenTypes.RESET_PASSWORD);

    const user = await userService.getUserById(resetKeyTokenDoc.user);
    if (!user) {
      throw new Error();
    }

    if (config.env !== 'test')
      await blockchainService.changeKey({
        coopname: config.coopname,
        changer: config.service_username,
        username: user.username,
        public_key: publicKey,
      });

    await userService.updateUserById(user._id, { public_key: publicKey });

    await Token.deleteMany({ user: user._id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
export const verifyEmail = async (verifyEmailToken) => {
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
};
