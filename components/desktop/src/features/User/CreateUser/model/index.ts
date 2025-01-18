import { api } from '../api';
import emailRegex from 'email-regex';
const emailValidator = emailRegex({ exact: true });

import { IGeneratedAccount, ISendStatement } from 'src/shared/lib/types/user';

import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';
import { COOPNAME } from 'src/shared/config';
import { IObjectedDocument } from 'src/shared/lib/types/document';
import {
  ICreatedPayment,
} from 'src/shared/lib/types/payments';
import {
  useCurrentUserStore,
} from 'src/entities/User';
import { useRegistratorStore } from 'src/entities/Registrator'
import { IEntrepreneurData, IIndividualData, IOrganizationData, IUserData } from 'src/shared/lib/types/user/IUserData';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export interface ICreateUser {
  email: string;
  entrepreneur_data?: IEntrepreneurData;
  individual_data?: IIndividualData;
  organization_data?: IOrganizationData;
  public_key: string;
  referer?: string;
  role: 'user';
  type: 'individual' | 'entrepreneur' | 'organization';
  username: string;
}

export function useCreateUser() {
  const store = useRegistratorStore().state

  async function createInitialPayment(): Promise<ICreatedPayment> {
    const result = await api.createInitialPaymentOrder();
    store.payment = result;

    return result;
  }

  async function sendStatementAndAgreements(): Promise<void> {
    const data: ISendStatement = {
      username: store.account.username,
      statement: store.statement,
      wallet_agreement: store.walletAgreement,
      privacy_agreement: store.privacyAgreement,
      signature_agreement: store.signatureAgreement,
      user_agreement: store.userAgreement
    };

    await api.sendStatement(data);
  }


  async function signStatement(): Promise<IObjectedDocument> {
    const variables: Mutations.Participants.GenerateParticipantApplication.IInput = {
      data: {
        signature: store.signature,
        skip_save: false,
        coopname: COOPNAME,
        username: store.account.username,
        braname: store.selectedBranch,
        links: [store.walletAgreement.hash, store.privacyAgreement.hash, store.signatureAgreement.hash, store.userAgreement.hash]
      }
    }

    const { [Mutations.Participants.GenerateParticipantApplication.name]: result } = await client.Mutation(
      Mutations.Participants.GenerateParticipantApplication.mutation,
      { variables }
    );

    store.statement = await client.Document.signDocument(result)

    return store.statement;
  }

  async function signPrivacyAgreement(): Promise<IObjectedDocument> {
    const variables: Mutations.Agreements.GeneratePrivacyAgreement.IInput = {
      data: {
        coopname: COOPNAME,
        username: store.account.username,
      }
    }

    const { [Mutations.Agreements.GeneratePrivacyAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.GeneratePrivacyAgreement.mutation,
      { variables }
    );

    store.privacyAgreement = await client.Document.signDocument(result)

    return store.privacyAgreement;
  }

  async function signSignatureAgreement(): Promise<IObjectedDocument> {
    const variables: Mutations.Agreements.GenerateSignatureAgreement.IInput = {
      data: {
        coopname: COOPNAME,
        username: store.account.username,
      }
    }

    const { [Mutations.Agreements.GenerateSignatureAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.GenerateSignatureAgreement.mutation,
      { variables }
    );

    store.signatureAgreement = await client.Document.signDocument(result)

    return store.signatureAgreement;

  }


  async function signUserAgreement(): Promise<IObjectedDocument> {
    const variables: Mutations.Agreements.GenerateUserAgreement.IInput = {
      data: {
        coopname: COOPNAME,
        username: store.account.username,
      }
    }

    const { [Mutations.Agreements.GenerateUserAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.GenerateUserAgreement.mutation,
      { variables }
    );

    store.userAgreement = await client.Document.signDocument(result)

    return store.userAgreement;

  }




  async function signWalletAgreement(): Promise<IObjectedDocument> {
    const variables: Mutations.Agreements.GenerateWalletAgreement.IInput = {
      data: {
        coopname: COOPNAME,
        username: store.account.username,
      }
    }

    const { [Mutations.Agreements.GenerateWalletAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.GenerateWalletAgreement.mutation,
      { variables }
    );

    store.walletAgreement = await client.Document.signDocument(result)

    return store.walletAgreement;
  }


  async function generateStatementWithoutSignature() {
    const variables: Mutations.Participants.GenerateParticipantApplication.IInput = {
      data: {
        signature: '',
        skip_save: true,
        coopname: COOPNAME,
        username: store.account.username,
        braname: store.selectedBranch,
      }
    }

    const { [Mutations.Participants.GenerateParticipantApplication.name]: result } = await client.Mutation(
      Mutations.Participants.GenerateParticipantApplication.mutation,
      { variables }
    );

    return result;

  }

  async function createUser(
    email: string,
    userData: IUserData,
    account: IGeneratedAccount
  ): Promise<void> {

    const synthData = { type: userData.type } as any;

    if (synthData.type === 'individual') {
      synthData.individual_data = userData.individual_data;
    } else if (synthData.type === 'organization') {
      synthData.organization_data = userData.organization_data;
    } else if (synthData.type === 'entrepreneur') {
      synthData.entrepreneur_data = userData.entrepreneur_data;
    }
    const data: ICreateUser = {
      ...synthData,
      role: 'user',
      email,
      username: account.username,
      public_key: account.public_key,
    };

    const { user, tokens } = await api.createUser(data);

    const globalStore = useGlobalStore();
    const sessionStore = useSessionStore();

    await globalStore.setTokens(tokens);
    await globalStore.setWif(user.username, account.private_key);

    await sessionStore.init();

    const currentUser = useCurrentUserStore();
    await currentUser.loadProfile(user.username, COOPNAME);
  }

  function emailIsValid(email: string): boolean {
    return emailValidator.test(email);
  }

  async function emailIsExist(email: string): Promise<boolean> {
    return await api.emailIsExist(email);
  }

  function generateAccount(): IGeneratedAccount {
    const keyPair = api.generateKeys();
    const username = api.generateUsername();

    return {
      username,
      ...keyPair,
    };
  }

  return {
    emailIsValid,
    emailIsExist,
    generateAccount,
    createUser,
    generateStatementWithoutSignature,
    signStatement,
    sendStatementAndAgreements,
    createInitialPayment,
    signWalletAgreement,
    signPrivacyAgreement,
    signUserAgreement,
    signSignatureAgreement
  };
}
