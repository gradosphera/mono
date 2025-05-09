import { api } from '../api';
import emailRegex from 'email-regex';
const emailValidator = emailRegex({ exact: true });

import { IGeneratedAccount } from 'src/shared/lib/types/user';

import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';
import { useSystemStore } from 'src/entities/System/model';

import {
  ICreatedPayment,
} from 'src/shared/lib/types/payments';
import {
  useCurrentUserStore,
} from 'src/entities/User';
import { useRegistratorStore } from 'src/entities/Registrator'
import { IEntrepreneurData, IIndividualData, IOrganizationData, IUserData, type IRegisterAccount } from 'src/shared/lib/types/user/IUserData';
import { client } from 'src/shared/api/client';
import { Mutations, Zeus } from '@coopenomics/sdk';
import { DigitalDocument } from 'src/shared/lib/document';
import { IDocument } from 'src/shared/lib/types/document';
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


export type ISendStatement = Mutations.Participants.RegisterParticipant.IInput['data'];
export type ISendStatementResult = Mutations.Participants.RegisterParticipant.IOutput[typeof Mutations.Participants.RegisterParticipant.name];


export function useCreateUser() {
  const store = useRegistratorStore().state
  const { info } = useSystemStore()

  async function createInitialPayment(): Promise<ICreatedPayment> {
    const result = await api.createInitialPaymentOrder();
    store.payment = result;

    return result;
  }

  async function sendStatementAndAgreements(): Promise<void> {
    const data: ISendStatement = {
      username: store.account.username,
      braname: store.selectedBranch,
      statement: store.statement,
      wallet_agreement: store.walletAgreement,
      privacy_agreement: store.privacyAgreement,
      signature_agreement: store.signatureAgreement,
      user_agreement: store.userAgreement
    };

    await api.sendStatement(data);
  }


  async function signStatement(): Promise<IDocument> {
    const variables: Mutations.Participants.GenerateParticipantApplication.IInput = {
      data: {
        signature: store.signature,
        skip_save: false,
        coopname: info.coopname,
        username: store.account.username,
        braname: store.selectedBranch,
        links: [store.walletAgreement.doc_hash, store.privacyAgreement.doc_hash, store.signatureAgreement.doc_hash, store.userAgreement.doc_hash]
      }
    }

    const { [Mutations.Participants.GenerateParticipantApplication.name]: result } = await client.Mutation(
      Mutations.Participants.GenerateParticipantApplication.mutation,
      { variables }
    );

    const digitalDocument = new DigitalDocument(result);
    store.statement = await digitalDocument.sign(store.account.username);

    return store.statement;
  }

  async function signPrivacyAgreement(): Promise<IDocument> {
    const variables: Mutations.Agreements.GeneratePrivacyAgreement.IInput = {
      data: {
        coopname: info.coopname,
        username: store.account.username,
      }
    }

    const { [Mutations.Agreements.GeneratePrivacyAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.GeneratePrivacyAgreement.mutation,
      { variables }
    );

    const digitalDocument = new DigitalDocument(result);
    store.privacyAgreement = await digitalDocument.sign(store.account.username);

    return store.privacyAgreement;
  }

  async function signSignatureAgreement(): Promise<IDocument> {
    const variables: Mutations.Agreements.GenerateSignatureAgreement.IInput = {
      data: {
        coopname: info.coopname,
        username: store.account.username,
      }
    }

    const { [Mutations.Agreements.GenerateSignatureAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.GenerateSignatureAgreement.mutation,
      { variables }
    );

    const digitalDocument = new DigitalDocument(result);
    store.signatureAgreement = await digitalDocument.sign(store.account.username);

    return store.signatureAgreement;
  }


  async function signUserAgreement(): Promise<IDocument> {
    const variables: Mutations.Agreements.GenerateUserAgreement.IInput = {
      data: {
        coopname: info.coopname,
        username: store.account.username,
      }
    }

    const { [Mutations.Agreements.GenerateUserAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.GenerateUserAgreement.mutation,
      { variables }
    );

    const digitalDocument = new DigitalDocument(result);
    store.userAgreement = await digitalDocument.sign(store.account.username);

    return store.userAgreement;
  }




  async function signWalletAgreement(): Promise<IDocument> {
    const variables: Mutations.Agreements.GenerateWalletAgreement.IInput = {
      data: {
        coopname: info.coopname,
        username: store.account.username,
      }
    }

    const { [Mutations.Agreements.GenerateWalletAgreement.name]: result } = await client.Mutation(
      Mutations.Agreements.GenerateWalletAgreement.mutation,
      { variables }
    );

    const digitalDocument = new DigitalDocument(result);
    store.walletAgreement = await digitalDocument.sign(store.account.username);

    return store.walletAgreement;
  }


  async function generateStatementWithoutSignature() {
    const variables: Mutations.Participants.GenerateParticipantApplication.IInput = {
      data: {
        signature: '',
        skip_save: true,
        coopname: info.coopname,
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
    generatedAccount: IGeneratedAccount
  ): Promise<void> {

    const synthData = { type: userData.type } as any;

    if (synthData.type === Zeus.AccountType.individual) {
      synthData.individual_data = userData.individual_data;
    } else if (synthData.type === Zeus.AccountType.organization) {
      synthData.organization_data = userData.organization_data;
    } else if (synthData.type === Zeus.AccountType.entrepreneur) {
      synthData.entrepreneur_data = userData.entrepreneur_data;
    }
    console.log('synthData: ', synthData);
    const data: IRegisterAccount = {
      ...synthData,
      email,
      username: generatedAccount.username,
      public_key: generatedAccount.public_key,
    };
    console.log('data: ', data);
    const { account, tokens } = await api.createUser(data);

    const globalStore = useGlobalStore();
    const sessionStore = useSessionStore();

    await globalStore.setTokens(tokens);
    await globalStore.setWif(account.username, generatedAccount.private_key);

    await sessionStore.init();

    const currentUser = useCurrentUserStore();
    await currentUser.loadProfile(account.username, info.coopname);
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
