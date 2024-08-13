import { api } from '../api';
import emailRegex from 'email-regex';
const emailValidator = emailRegex({ exact: true });

import { IGeneratedAccount, ISendStatement } from 'src/shared/lib/types/user';

import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';
import { reactive } from 'vue';
import { COOPNAME } from 'src/shared/config';
import { DigitalDocument } from 'src/entities/Document';
import { IGenerateJoinCoop } from 'src/entities/Document';
import { IObjectedDocument } from 'src/shared/lib/types/document';
import {
  ICreatedPayment,
  ICreateInitialPayment,
} from 'src/shared/lib/types/payments';
import { LocalStorage } from 'quasar';
import {
  IEntrepreneurData,
  IIndividualData,
  IOrganizationData,
  IUserData,
  useCurrentUserStore,
} from 'src/entities/User';

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

export const createUserStore = reactive({
  step: (LocalStorage.getItem(`${COOPNAME}:step`) as number) || 1,
  role: 'user',
  email: (LocalStorage.getItem(`${COOPNAME}:email`) as string) || '',
  account: LocalStorage.getItem(`${COOPNAME}:account`)
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      JSON.parse(LocalStorage.getItem(`${COOPNAME}:account`)!)
    : ({ username: '', private_key: '', public_key: '' } as IGeneratedAccount),
  userData: LocalStorage.getItem(`${COOPNAME}:userData`)
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      JSON.parse(LocalStorage.getItem(`${COOPNAME}:userData`)!)
    : ({
        type: 'individual',
        individual_data: {middle_name: ''},
        organization_data: {
          details: {},
          bank_account: { details: {} },
          represented_by: {middle_name: ''},
        },
        entrepreneur_data: { middle_name: '', details: {}, bank_account: { details: {} } },
      } as IUserData),
  signature: '',
  inLoading: false,
  agreements: {
    condidential: false,
    digital_signature: false,
    wallet: false,
    ustav: false,
    user: false,
    self_paid: false,
  },
  statement: {
    hash: '',
    meta: {},
    public_key: '',
    signature: '',
  },
  payment: {
    provider: 'yookassa',
    details: {
      token: '',
      url: '',
    },
  },
  is_paid: (LocalStorage.getItem(`${COOPNAME}:is_paid`) as boolean) || false,
});

export function useCreateUser() {
  async function createInitialPayment(): Promise<ICreatedPayment> {
    const data: ICreateInitialPayment = {
      provider: 'yookassa',
    };

    const result = await api.createInitialPayment(data);
    createUserStore.payment = result;

    return result;
  }

  async function sendStatement(): Promise<void> {
    const data: ISendStatement = {
      username: createUserStore.account.username,
      statement: createUserStore.statement,
    };

    await api.sendStatement(data);
  }

  async function signStatement(): Promise<IObjectedDocument> {
    const data: IGenerateJoinCoop = {
      signature: createUserStore.signature,
      skip_save: false,
      code: 'registrator',
      action: 'joincoop',
      coopname: COOPNAME,
      username: createUserStore.account.username,
    };

    const document = await new DigitalDocument().generate(data);

    const globalStore = useGlobalStore();
    const digital_signature = await globalStore.signDigest(document.hash);

    createUserStore.statement = {
      hash: document.hash,
      meta: document.meta,
      public_key: digital_signature.public_key,
      signature: digital_signature.signature,
    } as IObjectedDocument;

    return createUserStore.statement;
  }

  async function generateStatementWithoutSignature(username: string) {
    const data: IGenerateJoinCoop = {
      signature: '',
      skip_save: true,
      code: 'registrator',
      action: 'joincoop',
      coopname: COOPNAME,
      username,
    };
    const document = await new DigitalDocument().generate(data);

    return document;
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
    sendStatement,
    createInitialPayment,
  };
}
