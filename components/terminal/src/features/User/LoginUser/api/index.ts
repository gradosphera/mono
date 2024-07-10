import { sendPOST } from 'src/shared/api';
import { hashSHA256 } from 'src/shared/api/crypto';
import { ICreatedUser } from 'src/shared/lib/types/user';

async function loginUser(username: string, wif: string): Promise<ICreatedUser> {
  const password = await hashSHA256(wif);

  const data = {
    username,
    password,
  };

  const response = await sendPOST('/v1/auth/login', data, true);

  console.log('response: ', response);
  return response;
}

export const api = {
  loginUser,
};
