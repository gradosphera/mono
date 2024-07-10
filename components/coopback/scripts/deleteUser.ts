import config from '../src/config/config';
import { User } from '../src/models';
import { tokenService } from '../src/services';
import userService from '../src/services/user.service';
import mongoose from 'mongoose';

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Ошибка: Необходимо указать имя пользователя');
  process.exit(1);
}

const [username] = args;

async function deleteUser(username: string) {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);

    await userService.deleteUserById(username);

    console.log('Пользователь удалён: ', username);
  } catch (e: any) {
    console.log('Ошибка: ', e.message);
  }

  process.exit(0);
}

deleteUser(username);
