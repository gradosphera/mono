import { Bytes, Checksum256, PrivateKey } from '@wharfkit/session';
import { getBlockchainInfo } from 'src/shared/api';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function loginUser(email: string, wif: string) {
  const now = (await getBlockchainInfo()).head_block_time.toString()

  const privateKey = PrivateKey.fromString(wif)
  const bytes = Bytes.fromString(now, 'utf8')
  const checksum = Checksum256.hash(bytes)
  const signature = privateKey.signDigest(checksum).toString()

  const { [Mutations.Auth.Login.name]: result } = await client.Mutation(
    Mutations.Auth.Login.mutation,
    {
      variables: {
        data: {
          email,
          now,
          signature,
        },
      },
    }
  );

  return result;
}

export const api = {
  loginUser,
};
