import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

// Типы для мутации ConfirmAgreement
export type IConfirmAgreementInput = Mutations.Agreements.ConfirmAgreement.IInput['data'];
export type IConfirmAgreementOutput = Mutations.Agreements.ConfirmAgreement.IOutput[typeof Mutations.Agreements.ConfirmAgreement.name];

export const useConfirmAgreement = () => {
  const confirmAgreement = async (data: IConfirmAgreementInput): Promise<IConfirmAgreementOutput> => {
    const { [Mutations.Agreements.ConfirmAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.ConfirmAgreement.mutation,
      {
        variables: {
          data
        }
      }
    );

    return result;
  };

  return {
    confirmAgreement
  };
};
