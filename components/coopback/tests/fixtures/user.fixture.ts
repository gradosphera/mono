import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import faker from 'faker';
import User from '../../src/models/user.model';
import { generateUsername } from '../utils/generateUsername';

const password = 'password1';
const salt = bcrypt.genSaltSync(8);
const hashedPassword = bcrypt.hashSync(password, salt);
const email1 = faker.internet.email().toLowerCase();

export const userOne = {
  _id: mongoose.Types.ObjectId(),
  email: email1,
  password,
  username: generateUsername(),
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  role: 'user',
  is_email_verified: false,
  referer: '',
  type: 'individual',
  individual_data: {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+1234567890',
    email: email1,
    full_address: 'Russia, Moscow, Tverskaya street, 1',
  },
};
const email2 = faker.internet.email().toLowerCase();

export const userTwo = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: email2,
  signature: '-',
  signature_hash: '-',
  username: generateUsername(),
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  password,
  role: 'user',
  is_email_verified: false,
  referer: '',
  type: 'individual',
  individual_data: {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+1234567890',
    email: email2,
    full_address: 'Russia, Moscow, Tverskaya street, 2',
  },
};

const email3 = faker.internet.email().toLowerCase();
export const admin = {
  _id: mongoose.Types.ObjectId(),
  name: faker.name.findName(),
  email: email3,
  password,
  role: 'admin',
  is_email_verified: false,
  signature: '',
  signature_hash: '',
  username: generateUsername(),
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  referer: '',
  type: 'individual',
  individual_data: {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+1234567890',
    email: email3,
    full_address: 'Russia, Moscow, Tverskaya street, 3',
  },
};

export const insertUsers = async (users: any[]) => {
  await User.insertMany(users.map((user: any) => ({ ...user, password: hashedPassword })));
};
