import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import faker from 'faker';
import User, { IUser } from '../../src/models/user.model';
import { generateUsername } from '../utils/generateUsername';
import { Cooperative } from 'cooptypes';
import { ICreateUser } from '../../src/types';
import { ObjectId } from 'mongodb';

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);

const generateRandomId = () => new mongoose.Types.ObjectId();

type testUser = Omit<IUser, 'getPrivateData' | 'isPasswordMatch' | 'private_data'> & {
  _id: mongoose.Types.ObjectId;
  individual_data?: Cooperative.Users.IIndividualData;
  organization_data?: Cooperative.Users.IOrganizationData;
  entrepreneur_data?: Cooperative.Users.IEntrepreneurData;
};

const email1 = faker.internet.email().toLowerCase();
const email2 = faker.internet.email().toLowerCase();
const email3 = faker.internet.email().toLowerCase();
const email4 = faker.internet.email().toLowerCase();
const email5 = faker.internet.email().toLowerCase();

const adminUsername = generateUsername();

export const admin: testUser = {
  _id: generateRandomId(),
  email: email1,
  password,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'chairman',
  is_email_verified: false,
  username: adminUsername,
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: undefined,
    public_key: '',
    signature: '',
  },
  referer: '',
  type: 'individual',
  individual_data: {
    username: adminUsername,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+1234567890',
    email: email1,
    full_address: 'Russia, Moscow, Tverskaya street, 3',
  },
};

export const userOne: testUser = {
  _id: generateRandomId(),
  email: email2,
  password,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'user',
  is_email_verified: false,
  username: generateUsername(),
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: undefined,
    public_key: '',
    signature: '',
  },
  referer: '',
  type: 'individual',
  individual_data: {
    username: generateUsername(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+1234567890',
    email: email2,
    full_address: 'Russia, Moscow, Tverskaya street, 1',
  },
};

export const userTwo: testUser = {
  _id: generateRandomId(),
  email: email3,
  password,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'user',
  is_email_verified: false,
  username: generateUsername(),
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: undefined,
    public_key: '',
    signature: '',
  },
  referer: '',
  type: 'individual',
  individual_data: {
    username: generateUsername(),
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+1234567890',
    email: email3,
    full_address: 'Russia, Moscow, Tverskaya street, 2',
  },
};

export const chairman: testUser = {
  _id: generateRandomId(),
  email: email4,
  password,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'user',
  is_email_verified: false,
  username: 'ant',
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: undefined,
    public_key: '',
    signature: '',
  },
  referer: '',
  type: 'individual',
  individual_data: {
    username: 'ant',
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+1234567890',
    email: email4,
    full_address: 'Russia, Moscow, Tverskaya street, 1',
  },
};

export const voskhod: testUser = {
  _id: generateRandomId(),
  email: email5,
  password,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'user',
  is_email_verified: false,
  username: 'voskhod',
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: undefined,
    public_key: '',
    signature: '',
  },
  referer: '',
  type: 'organization',
  organization_data: {
    username: 'voskhod',
    type: 'coop',
    is_cooperative: true,
    short_name: '"ПК Восход"',
    full_name: 'Потребительский Кооператив "ВОСХОД"',
    represented_by: {
      first_name: 'Имя',
      last_name: 'Фамилия',
      middle_name: 'Отчество',
      position: 'Председатель',
      based_on: 'Решения общего собрания №1',
    },
    country: 'Russia',
    city: 'Москва',
    full_address: 'Переулок Правды, дом 1',
    email: email5,
    phone: '+71234567890',
    details: {
      inn: '1234567890',
      ogrn: '1234567890123',
    },
    bank_account: {
      account_number: '40817810099910004312',
      currency: 'RUB',
      card_number: '1234567890123456',
      bank_name: 'Sberbank',
      details: {
        bik: '123456789',
        corr: '30101810400000000225',
        kpp: '123456789',
      },
    },
  },
};

export const insertPrivateEntrepreneurUserData = async (data: Cooperative.Users.IEntrepreneurData) => {
  const collection = mongoose.connection.db.collection('EntrepreneurData'); // Замените на имя вашей коллекции
  await collection.insertOne(data);
};

export const insertPrivateIndividualUserData = async (data: Cooperative.Users.IIndividualData) => {
  const collection = mongoose.connection.db.collection('IndividualData'); // Замените на имя вашей коллекции
  await collection.insertOne(data);
};

export const insertPrivateOrganizationUserData = async (data: Cooperative.Users.IOrganizationData) => {
  const collection = mongoose.connection.db.collection('OrgData'); // Замените на имя вашей коллекции
  await collection.insertOne(data);
};

export const insertUsers = async (users: testUser[]) => {
  for (const user of users) {
    const { type, individual_data, organization_data, entrepreneur_data, ...rest } = user;

    await User.insertMany([{ ...rest, type, password: hashedPassword }]);

    if (type === 'individual' && individual_data) {
      await insertPrivateIndividualUserData({ ...individual_data, username: rest.username });
    } else if (type === 'organization' && organization_data) {
      await insertPrivateOrganizationUserData({ ...organization_data, username: rest.username });
    } else if (type === 'entrepreneur' && entrepreneur_data) {
      await insertPrivateEntrepreneurUserData({ ...entrepreneur_data, username: rest.username });
    }
  }
};
