import http from 'http-status';
import httpStatus from 'http-status';
import { User } from '../models';
import { HttpApiError } from '../utils/httpApiError';
import type { IUser } from '~/types';

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

  if (!user) throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');

  return user;
};

/**
 * Get user by username
 * @param {string} id
 * @returns {Promise<User>}
 */
export const getUserById = async (_id: string) => {
  const user = await User.findById(_id);

  if (!user) throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');

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
    throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email))) {
    throw new HttpApiError(httpStatus.BAD_REQUEST, 'Email already taken');
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
    throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
  }

  if (updateBody.email && (await User.isEmailTaken(updateBody.email, username))) {
    throw new HttpApiError(httpStatus.BAD_REQUEST, 'Email уже занят');
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
    throw new HttpApiError(httpStatus.NOT_FOUND, 'Пользователь не найден');
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

/**
 * Find users without subscriber_id for notification sync
 * @returns {Promise<IUser[]>}
 */
export const findUsersWithoutSubscriberId = async (): Promise<IUser[]> => {
  const users = await User.find({
    $or: [{ subscriber_id: { $exists: false } }, { subscriber_id: null }, { subscriber_id: '' }],
  }).limit(100); // Ограничиваем для безопасности

  return users;
};
