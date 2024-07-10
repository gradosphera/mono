import httpStatus from 'http-status';
import * as tokenService from './token.service';
import userService from './user.service';
import { getSoviet } from './blockchain.service';
import Token from '../models/token.model';
import ApiError from '../utils/ApiError';
import { tokenTypes } from '../config/tokens';

export const updateAuth = async () => {
  try {
    const board = await getSoviet(process.env.COOPNAME);
    // TODO снимать права с тех, кто уже не в совете
    // eslint-disable-next-line no-restricted-syntax
    for (const member of board.members) {
      // eslint-disable-next-line no-await-in-loop
      const user = await userService.getUserByUsername(member.username);
      if (member.position === 'chairman' && !user) {
        // eslint-disable-next-line no-await-in-loop
        // await userService.createUser({
        //   username: member.username,
        //   public_key: '-',
        //   email: process.env.CHAIRMAN_EMAIL ,
        //   password: process.env.CHAIRMAN_PASSWORD as string,
        //   is_registered: true,
        //   is_organization: false,
        //   user_profile: {
        //     first_name: 'Имя',
        //     last_name: 'Фамилия',
        //     middle_name: 'Отчество',
        //     birthday: '23-42-3423',
        //     phone: '+7902294404',
        //   },
        //   signature: '-',
        //   signature_hash: '-',
        //   role: 'chairman',
        // });
      } else if (member.position === 'chairman' && user) {
        user.role = 'chairman';
        user.password = process.env.CHAIRMAN_PASSWORD || 'password';
        // eslint-disable-next-line no-await-in-loop
        await user.save();
      } else if (user) {
        user.role = 'admin';
        // eslint-disable-next-line no-await-in-loop
        await user.save();
      }
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log('Ошибка при автоматической проверке целевой авторизации: ', e.message);
  }
};

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<User>}
 */
export const loginUserWithUsernameAndPassword = async (username, password) => {
  const user = await userService.getUserByUsername(username);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect username or password');
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
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
export const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserByUsername(refreshTokenDoc.user);

    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();

    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
export const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserByUsername(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.username, { password: newPassword });
    await Token.deleteMany({ user: user.username, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
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
    const user = await userService.getUserByUsername(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.username, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.username, { is_email_verified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};
