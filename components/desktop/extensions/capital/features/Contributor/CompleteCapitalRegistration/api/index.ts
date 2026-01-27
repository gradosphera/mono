import { Mutations } from '@coopenomics/sdk';
import { client } from 'src/shared/api/client';

export type ICompleteCapitalRegistrationInput =
  Mutations.Capital.CompleteCapitalRegistration.IInput['data'];

export type ICompleteCapitalRegistrationOutput =
  Mutations.Capital.CompleteCapitalRegistration.IOutput[typeof Mutations.Capital.CompleteCapitalRegistration.name];

async function completeCapitalRegistration(
  data: ICompleteCapitalRegistrationInput
): Promise<ICompleteCapitalRegistrationOutput> {
  const { [Mutations.Capital.CompleteCapitalRegistration.name]: result } =
    await client.Mutation(Mutations.Capital.CompleteCapitalRegistration.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  completeCapitalRegistration,
};
