import http from 'http-status';
import { User } from '../models';
import ApiError from '../utils/ApiError';
import { generator } from './document.service';
import { ICreateUser } from '../types/auto-generated/user.validation';
import type { Cooperative } from 'cooptypes';
import { randomUUID } from 'crypto';
import type { IUser } from '~/types';

export const createUser = async (userBody: ICreateUser) => {
  //TODO проверяем на существование пользователя
  //допускаем обновление личных данных, если пользователь находится в статусе 'created'

  const exist = await User.findOne({ email: userBody.email });

  if (exist && exist.status !== 'created')
    if (await User.isEmailTaken(userBody.email)) {
      throw new ApiError(http.BAD_REQUEST, 'Пользователь с указанным EMAIL уже зарегистрирован');
    }

  if (userBody.type === 'individual') {
    if (!userBody.individual_data) throw new ApiError(http.BAD_REQUEST, 'Individual data is required');
    else userBody.individual_data.email = userBody.email;
  }

  if (userBody.type === 'organization') {
    if (!userBody.organization_data) throw new ApiError(http.BAD_REQUEST, 'Organization data is required');
    else userBody.organization_data.email = userBody.email;
  }

  if (userBody.type === 'entrepreneur') {
    if (!userBody.entrepreneur_data) throw new ApiError(http.BAD_REQUEST, 'Entrepreneur data is required');
    else userBody.entrepreneur_data.email = userBody.email;
  }

  if (userBody.type === 'individual' && userBody.individual_data)
    await generator.save('individual', { username: userBody.username, ...userBody.individual_data });

  if (userBody.type === 'organization' && userBody.organization_data) {
    const { bank_account, ...userData } = userBody.organization_data || {};

    const paymentMethod: Cooperative.Payments.IPaymentData = {
      username: userBody.username,
      method_id: randomUUID(),
      method_type: 'bank_transfer',
      is_default: true,
      data: bank_account,
    };

    await generator.save('organization', { username: userBody.username, ...userData });
    await generator.save('paymentMethod', paymentMethod);
  }

  if (userBody.type === 'entrepreneur' && userBody.entrepreneur_data) {
    const { bank_account, ...userData } = userBody.entrepreneur_data || {};

    const paymentMethod: Cooperative.Payments.IPaymentData = {
      username: userBody.username,
      method_id: randomUUID(),
      method_type: 'bank_transfer',
      is_default: true,
      data: bank_account,
    };

    await generator.save('entrepreneur', { username: userBody.username, ...userData });
    await generator.save('paymentMethod', paymentMethod);
  }

  if (exist) {
    Object.assign(exist, userBody);
    await exist.save();
    return exist;
  } else {
    return User.create(userBody);
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);

  return users;
};

/**
 * Get user by username
 * @param {string} username
 * @returns {Promise<User>}
 */
export const getUserByUsername = async (username: string) => {
  const user = await User.findOne({ username });

  if (!user) throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');

  return user;
};

/**
 * Get user by username
 * @param {string} id
 * @returns {Promise<User>}
 */
export const getUserById = async (_id: string) => {
  const user = await User.findById(_id);

  if (!user) throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');

  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
export const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

/**
 * Update user by username
 * @param {string} username
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
export const updateUserById = async (id, updateBody) => {
  const user = await getUserById(id);
  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email))) {
    throw new ApiError(http.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Update user by username
 * @param {string} username
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
export const updateUserByUsername = async (username, updateBody) => {
  const user = await getUserByUsername(username);

  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, username))) {
    throw new ApiError(http.BAD_REQUEST, 'Email уже занят');
  }
  Object.assign(user, updateBody);

  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {string} username
 * @returns {Promise<User>}
 */
export const deleteUserByUsername = async (username) => {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }
  await user.deleteOne();
  return user;
};

export const findUser = async (username): Promise<IUser | null> => {
  const user = await User.findOne({ username });
  return user;
};

/**
 * Find user by subscriber_id
 * @param {string} subscriber_id
 * @returns {Promise<IUser | null>}
 */
export const findUserBySubscriberId = async (subscriber_id: string): Promise<IUser | null> => {
  const user = await User.findOne({ subscriber_id });
  return user;
};
