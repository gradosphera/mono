import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

// Типы для мутации SendAgreement
export type ISendAgreementInput = Mutations.Agreements.SendAgreement.IInput['data'];
export type ISendAgreementOutput = Mutations.Agreements.SendAgreement.IOutput[typeof Mutations.Agreements.SendAgreement.name];

export const useSendAgreement = () => {
  const sendAgreement = async (data: ISendAgreementInput): Promise<ISendAgreementOutput> => {
    const { [Mutations.Agreements.SendAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.SendAgreement.mutation,
      {
        variables: {
          data
        }
      }
    );

    return result;
  };

  return {
    sendAgreement
  };
};
