import { sendPOST } from 'src/shared/api';

import type { IAddUser } from '@coopenomics/controller';

async function addUser(data: IAddUser): Promise<void> {
  await sendPOST('/v1/users/add', data);
}

export const api = {
  addUser,
};
