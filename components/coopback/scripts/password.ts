import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
const { compare, hash } = bcryptjs;

async function generate() {
  const wif = '';

  const hash_from_wif = await crypto.createHash('sha256').update(wif).digest('hex');

  const password = await hash(hash_from_wif, 8)
  console.log(password)
}

generate();
