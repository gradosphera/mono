import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import faker from 'faker';
import User from '../../src/models/user.model';
import { generateUsername } from '../../src/utils/generate-username';
import { Cooperative } from 'cooptypes';
import { ICreateUser, type IUser } from '../../src/types';
import { ObjectId } from 'mongodb';

const generateRandomId = () => new mongoose.Types.ObjectId();

type testUser = Omit<IUser, 'getPrivateData' | 'isPasswordMatch' | 'private_data'> & {
  _id: mongoose.Types.ObjectId;
  individual_data?: Cooperative.Users.IIndividualData;
  organization_data?: Cooperative.Users.IOrganizationData;
  entrepreneur_data?: Cooperative.Users.IEntrepreneurData;
  block_num: number;
  deleted: boolean;
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
  status: 'active',
  has_account: false,
  message: '',
  is_registered: true,
  role: 'chairman',
  is_email_verified: false,
  username: adminUsername,
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: {},
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
    phone: '+71234567890',
    email: email1,
    full_address: 'Russia, Moscow, Tverskaya street, 3',
  },
  block_num: 0,
  deleted: false,
};

const usernameOne = generateUsername();
export const userOne: testUser = {
  _id: generateRandomId(),
  email: email2,
  has_account: false,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'user',
  is_email_verified: false,
  username: usernameOne,
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: {},
    public_key: '',
    signature: '',
  },
  referer: '',
  type: 'individual',
  individual_data: {
    username: usernameOne,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+71234567890',
    email: email2,
    full_address: 'Russia, Moscow, Tverskaya street, 1',
  },
  block_num: 0,
  deleted: false,
};

const usernameTwo = generateUsername();
export const userTwo: testUser = {
  _id: generateRandomId(),
  email: email3,
  has_account: false,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'user',
  is_email_verified: false,
  username: usernameTwo,
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: {},
    public_key: '',
    signature: '',
  },
  referer: '',
  type: 'individual',
  individual_data: {
    username: usernameTwo,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+71234567890',
    email: email3,
    full_address: 'Russia, Moscow, Tverskaya street, 2',
  },
  block_num: 0,
  deleted: false,
};

export const chairman: testUser = {
  _id: generateRandomId(),
  email: email4,
  has_account: false,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'user',
  is_email_verified: false,
  username: 'ant',
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: {},
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
    phone: '+71234567890',
    email: email4,
    full_address: 'Russia, Moscow, Tverskaya street, 1',
  },
  block_num: 0,
  deleted: false,
};

export const voskhod: testUser = {
  _id: generateRandomId(),
  email: email5,
  has_account: false,
  status: 'active',
  message: '',
  is_registered: true,
  role: 'user',
  is_email_verified: false,
  username: 'voskhod',
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  statement: {
    hash: '',
    meta: {},
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
    phone: '+771234567890',
    details: {
      inn: '71234567890',
      ogrn: '71234567890123',
    },
    bank_account: {
      account_number: '40817810099910004312',
      currency: 'RUB',
      card_number: '71234567890123456',
      bank_name: 'Sberbank',
      details: {
        bik: '123456789',
        corr: '30101810400000000225',
        kpp: '123456789',
      },
    },
  },
  block_num: 0,
  deleted: false,
};

export const insertPrivateEntrepreneurUserData = async (data: any) => {
  const collection = mongoose.connection.db.collection('EntrepreneurData'); // Замените на имя вашей коллекции
  await collection.insertOne({ ...data });
};

export const insertPrivateIndividualUserData = async (data: any) => {
  const collection = mongoose.connection.db.collection('IndividualData'); // Замените на имя вашей коллекции
  await collection.insertOne({ ...data });
};

export const insertPrivateOrganizationUserData = async (data: any) => {
  const collection = mongoose.connection.db.collection('OrgData'); // Замените на имя вашей коллекции
  await collection.insertOne({ ...data });
};

export interface IPaymentData {
  username: string;
  method_id: number;
  user_type: 'individual' | 'entrepreneur' | 'organization';
  method_type: 'sbp' | 'bank_transfer';
  is_default: boolean;
  data: any;
}

export const insertPaymentMethod = async (data: IPaymentData, block_num: number) => {
  const collection = mongoose.connection.db.collection('PaymentData'); // Замените на имя вашей коллекции
  await collection.insertOne({ ...data, block_num, _created_at: new Date(), deleted: false });
};

export const insertUsers = async (users: testUser[]) => {
  for (const user of users) {
    const { type, individual_data, organization_data, entrepreneur_data, block_num, ...rest } = user;

    await User.insertMany([{ ...rest, type }]);

    if (type === 'individual' && individual_data) {
      await insertPrivateIndividualUserData({
        ...individual_data,
        username: rest.username,
        block_num,
        _created_at: new Date(),
      });
    } else if (type === 'organization' && organization_data) {
      const { bank_account, ...org_data } = organization_data;
      await insertPrivateOrganizationUserData({ ...org_data, username: rest.username, block_num, _created_at: new Date() });

      await insertPaymentMethod(
        {
          username: rest.username,
          method_id: 1,
          user_type: 'organization',
          method_type: 'bank_transfer',
          is_default: true,
          data: bank_account,
        },
        block_num
      );
    } else if (type === 'entrepreneur' && entrepreneur_data) {
      const { bank_account, ...entr_data } = entrepreneur_data;

      await insertPrivateEntrepreneurUserData({ ...entr_data, username: rest.username, block_num, _created_at: new Date() });

      await insertPaymentMethod(
        {
          username: rest.username,
          method_id: 1,
          user_type: 'organization',
          method_type: 'bank_transfer',
          is_default: true,
          data: bank_account,
        },
        block_num
      );
    }
  }
};
