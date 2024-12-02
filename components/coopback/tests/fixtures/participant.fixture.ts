import faker from 'faker';
import { generateUsername } from '../utils/generateUsername';
import { ICreateUser } from '../../src/types';

const email1 = faker.internet.email().toLowerCase();

export const participantOne: ICreateUser = {
  email: email1,
  username: generateUsername(),
  public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
  role: 'user',
  referer: '',
  type: 'individual',
  individual_data: {
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    middle_name: '',
    birthdate: '2023-04-01',
    phone: '+77123467890',
    email: email1,
    full_address: 'Russia, Moscow, Tverskaya street, 1',
  },
};
