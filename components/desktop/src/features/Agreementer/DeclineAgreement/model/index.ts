import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

// Типы для мутации DeclineAgreement
export type IDeclineAgreementInput = Mutations.Agreements.DeclineAgreement.IInput['data'];
export type IDeclineAgreementOutput = Mutations.Agreements.DeclineAgreement.IOutput[typeof Mutations.Agreements.DeclineAgreement.name];

export const useDeclineAgreement = () => {
  const declineAgreement = async (data: IDeclineAgreementInput): Promise<IDeclineAgreementOutput> => {
    const { [Mutations.Agreements.DeclineAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.DeclineAgreement.mutation,
      {
        variables: {
          data
        }
      }
    );

    return result;
  };

  return {
    declineAgreement
  };
};
