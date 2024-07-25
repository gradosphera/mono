import config from '../../src/config/config';
import { User } from '../../src/models';
import { tokenService } from '../../src/services';
import { userService } from '../../src/services';
import mongoose from 'mongoose';
import { connectGenerator } from '../../src/services/document.service';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

const { compare, hash } = bcryptjs;

async function init() {
  try {
    await connectGenerator();

    await mongoose.connect(config.mongoose.url, config.mongoose.options);

    const orgs_collection = mongoose.connection.collection('OrgData');
    const bankData_collection = mongoose.connection.collection('PaymentData');

    const orgs = await orgs_collection.find().toArray();

    for (const org of orgs) {
      await bankData_collection.insertOne({
        _created_at: org._created_at,
        username: org.username,
        method_id: 1,
        user_type: 'organization',
        method_type: 'bank_transfer',
        is_default: true,
        data: org.bank_account,
        deleted: false,
        block_num: org.block_num,
      });
    }
  } catch (e: any) {
    console.log('Ошибка: ', e);
  }

  process.exit(0);
}

init();
