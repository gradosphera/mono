import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
const { compare, hash } = bcryptjs;

async function generate() {
  const wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3';

  const hash_from_wif = await crypto.createHash('sha256').update(wif).digest('hex');
  console.log('hash_from_wif: ', hash_from_wif);
  const password = await hash(hash_from_wif, 8);
  console.log(password);
}

generate();
