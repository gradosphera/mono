import config from '../src/config/config';
import { User } from '../src/models';
import { tokenService } from '../src/services';
import { userService } from '../src/services';
import mongoose from 'mongoose';
import { connectGenerator } from '../src/services/document.service';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

const { compare, hash } = bcryptjs;

async function init() {
  try {
    await connectGenerator();

    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    const wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';

    await userService.createUser({
      username: 'ant',
      email: 'dacom.dark.sun@gmail.com',
      public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
      role: 'user',
      type: 'individual',
      individual_data: {
        first_name: 'Иван',
        last_name: 'Иванов',
        middle_name: 'Иванович',
        birthdate: '2000-01-01',
        phone: '+1234567890',
        email: 'ivanov.ivan@example.com',
        full_address: 'Переулок Иванов д. 1',
      },
    });

    const user = await userService.getUserByUsername('ant');
    user.status = 'active';
    user.is_registered = true;
    await user.save();

    const voskhod = await userService.createUser({
      username: 'voskhod',
      email: 'chairman.voskhod@gmail.com',
      public_key: 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV',
      role: 'user',
      type: 'organization',
      organization_data: {
        is_cooperative: true,
        type: 'coop',
        short_name: '"ПК ТЕСТ-Восход"',
        full_name: 'Потребительский Кооператив "ТЕСТ-ВОСХОД"',
        represented_by: {
          first_name: 'Иван',
          last_name: 'Иванов',
          middle_name: 'Иванович',
          position: 'Председатель',
          based_on: 'Решения общего собрания №1',
        },
        country: 'Russia',
        city: 'Москва',
        full_address: 'Переулок Правды, дом 1',
        email: 'chairman.voskhod@gmail.com',
        phone: '+77077770707',
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
    });

    const coop = await userService.getUserByUsername('voskhod');
    coop.status = 'active';
    coop.is_registered = true;
    await coop.save();

    console.log('ok');
  } catch (e: any) {
    console.log('Ошибка: ', e);
  }

  process.exit(0);
}

init();
