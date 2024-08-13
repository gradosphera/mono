import http from 'http-status';
import { User } from '../models';
import ApiError from '../utils/ApiError';
import { generator } from './document.service';
import { ICreateUser, IJoinCooperative } from '../types/auto-generated/user.validation';
import { PublicKey, Signature } from '@wharfkit/antelope';
import faker from 'faker';
import { randomBytes } from 'crypto';

export const createServiceUser = async (username: string) => {
  const password = randomBytes(16).toString('hex');
  return User.create({
    username,
    type: 'service',
    role: 'service',
    public_key: 'thanks-no-need',
    password,
    email: faker.internet.email().toLowerCase(),
  });
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
export const createUser = async (userBody: ICreateUser) => {
  //TODO проверяем на существование пользователя
  //допускаем обновление личных данных, если пользователь находится в статусе 'created'

  const exist = await User.findOne({ email: userBody.email });

  if (userBody.type === 'individual' && !userBody.individual_data)
    throw new ApiError(http.BAD_REQUEST, 'Individual data is required');

  if (userBody.type === 'organization' && !userBody.organization_data)
    throw new ApiError(http.BAD_REQUEST, 'Organization data is required');

  if (userBody.type === 'entrepreneur' && !userBody.entrepreneur_data)
    throw new ApiError(http.BAD_REQUEST, 'Entrepreneur data is required');

  if (exist && exist.status !== 'created')
    if (await User.isEmailTaken(userBody.email)) {
      throw new ApiError(http.BAD_REQUEST, 'Пользователь с указанным EMAIL уже зарегистрирован');
    }

  if (userBody.type === 'individual' && userBody.individual_data)
    await generator.save('individual', { username: userBody.username, ...userBody.individual_data });

  if (userBody.type === 'organization' && userBody.organization_data)
    await generator.save('organization', { username: userBody.username, ...userBody.organization_data });

  if (userBody.type === 'entrepreneur' && userBody.entrepreneur_data)
    await generator.save('entrepreneur', { username: userBody.username, ...userBody.entrepreneur_data });

  if (exist) {
    Object.assign(exist, userBody);
    await exist.save();
    return exist;
  } else {
    return User.create(userBody);
  }
};

/**
 * Join a Cooperative
 *
 */
export const joinCooperative = async (data: IJoinCooperative): Promise<void> => {
  const user = await getUserByUsername(data.username);

  if (!user) {
    throw new ApiError(http.NOT_FOUND, 'Пользователь не найден');
  }

  user.statement = data.statement;
  user.status = 'joined';

  const hash = data.statement.hash;
  const public_key = PublicKey.from(data.statement.public_key);
  const signature = Signature.from(data.statement.signature);

  const verified: boolean = signature.verifyDigest(hash, public_key);

  if (!verified) {
    throw new ApiError(http.INTERNAL_SERVER_ERROR, 'Invalid signature');
  }

  if (user.public_key !== data.statement.public_key) throw new ApiError(http.BAD_REQUEST, 'Public keys are mismatched');

  await user.save();
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
  if (updateBody.email && (await User.isEmailTaken(updateBody.email))) {
    throw new ApiError(http.BAD_REQUEST, 'Email already taken');
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
