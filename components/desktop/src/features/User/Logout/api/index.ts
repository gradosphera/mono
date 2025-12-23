import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function logoutUser(accessToken: string, refreshToken: string): Promise<boolean> {
  const { [Mutations.Auth.Logout.name]: result } = await client.Mutation(
    Mutations.Auth.Logout.mutation,
    {
      variables: {
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      },
    }
  );

  return result;
}

export const api = {
  logoutUser,
}
