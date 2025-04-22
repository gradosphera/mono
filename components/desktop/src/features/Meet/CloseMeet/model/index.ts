import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type ISignBySecretaryInput = Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.IInput['data'];
export type ISignBySecretaryResult = Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.IOutput[typeof Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet.name];
export type ISignByPresiderInput = Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.IInput['data'];
export type ISignByPresiderResult = Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.IOutput[typeof Mutations.Meet.SignByPresiderOnAnnualGeneralMeet.name];

export async function signBySecretaryOnAnnualGeneralMeet(data: ISignBySecretaryInput): Promise<ISignBySecretaryResult> {
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

export async function signByPresiderOnAnnualGeneralMeet(data: ISignByPresiderInput): Promise<ISignByPresiderResult> {
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
