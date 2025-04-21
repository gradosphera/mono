import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type ISignBySecretaryInput = Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.IInput['data'];
export type ISignByPresiderInput = Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.IInput['data'];

export async function signBySecretaryOnAnnualGeneralMeet(data: ISignBySecretaryInput) {
  const { [Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.name]: result } = await client.Mutation(
    Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.mutation,
    {
      variables: {
        data
      }
    }
  );
  return result;
}

export async function signByPresiderOnAnnualGeneralMeet(data: ISignByPresiderInput) {
  const { [Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.name]: result } = await client.Mutation(
    Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.mutation,
    {
      variables: {
        data
      }
    }
  );
  return result;
}
