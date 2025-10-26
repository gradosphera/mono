import { PrivateKey } from '@wharfkit/antelope';
import { IKeyPair } from 'src/shared/lib/types/user';
import { Mutations } from '@coopenomics/sdk';
import { client } from 'src/shared/api/client';
import type {
  IRegisterAccount,
  IRegisteredAccountResult,
} from 'src/shared/lib/types/user/IUserData';
import type { ISendStatement, ISendStatementResult } from '../model';
import { useSessionStore } from 'src/entities/Session';
import type { IInitialPaymentOrder } from 'src/shared/lib/types/payments';

async function createUser(
  data: IRegisterAccount,
): Promise<IRegisteredAccountResult> {
  const { [Mutations.Accounts.RegisterAccount.name]: result } =
    await client.Mutation(Mutations.Accounts.RegisterAccount.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function sendStatement(
  data: ISendStatement,
): Promise<ISendStatementResult> {
  const { [Mutations.Participants.RegisterParticipant.name]: result } =
    await client.Mutation(Mutations.Participants.RegisterParticipant.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function emailIsExist(email: string): Promise<boolean> {
  //TODO verify email exists on backend
  console.log('check email before: ', email);
  return false;
}

function generateKeys(): IKeyPair {
  const private_key_data = PrivateKey.generate('K1');
  const public_key = private_key_data.toPublic().toString();
  const private_key = private_key_data.toWif();

  return {
    private_key,
    public_key,
  } as IKeyPair;
}

const generateUsername = (): string => {
  let result = '';

  const possible = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 12; i++)
    result += possible.charAt(Math.floor(Math.random() * possible.length));

  //TODO check for not exist in blockchain

  return result;
};

async function createInitialPaymentOrder(): Promise<IInitialPaymentOrder> {
  const session = useSessionStore();

  const { [Mutations.Participants.CreateInitialPayment.name]: result } =
    await client.Mutation(
      Mutations.Participants.CreateInitialPayment.mutation,
      {
        variables: {
          data: {
            username: session.username as string,
          },
        },
      },
    );

  return result;
}

export const api = {
  createUser,
  emailIsExist,
  generateUsername,
  generateKeys,
  sendStatement,
  createInitialPaymentOrder,
};
