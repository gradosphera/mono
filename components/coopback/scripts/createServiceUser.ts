import config from '../src/config/config';
import { User } from '../src/models';
import { tokenService } from '../src/services';
import { userService } from '../src/services';
import mongoose from 'mongoose';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Ошибка: Необходимо указать имя пользователя');
  process.exit(1);
}

const [username] = args;

async function createServiceUser(username: string) {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);

    const user = await userService.createServiceUser(username);
    const token = await tokenService.generateServiceAccessToken(user);
    console.log('token:', token.access.token);
  } catch (e: any) {
    console.log('Ошибка: ', e.message);
  }

  process.exit(0);
}

createServiceUser(username);
