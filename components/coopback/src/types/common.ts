import { IEntrepreneurData, IGeneratedDocument, IIndividualData, IOrganizationData } from 'coopdoc-generator-ts';
import { Cooperative, SovietContract } from 'cooptypes';

// Определение унифицированного типа для деталей платежа
export interface PaymentDetails {
  url: string; // URL для перенаправления пользователя
  token: string; // Токен для создания встроенной формы оплаты
}

export interface IYandexIPN {
  type: string;
  event: string;
  object: {
    id: string;
    status: string;
    paid: boolean;
    amount: {
      value: string;
      currency: string;
    };
    income_amount: {
      value: string;
      currency: string;
    };
    authorization_details: {
      rrn: string;
      auth_code: string;
      three_d_secure: {
        applied: boolean;
      };
    };
    created_at: string;
    description: string;
    expires_at: string;
    metadata: Record<string, unknown>;
    payment_method: {
      type: string;
      id: string;
      saved: boolean;
      card: {
        first6: string;
        last4: string;
        expiry_month: string;
        expiry_year: string;
        card_type: string;
        issuer_country: string;
        issuer_name: string;
      };
      title: string;
    };
    refundable: boolean;
    test: boolean;
  };
}

export interface ICreatedPayment {
  provider: string;
  order_id: string | number;
  details: PaymentDetails;
}

export type IGetResponse<T> = Cooperative.Documents.IGetResponse<T>;

export interface IGetActions<T> {
  results: IAction[];
  page: number;
  limit: number;
}

export interface IGetTables<T> {
  results: ITable[];
  page: number;
  limit: number;
}

export interface ITable {
  chain_id: string;
  block_num: number;
  block_id: string;
  present: string;
  code: string;
  scope: string;
  table: string;
  primary_key: string;
  value?: any;
}

export interface IAction {
  transaction_id: string;
  account: string;
  block_num: number;
  block_id: string;
  chain_id: string;
  name: string;
  receiver: string;
  authorization: Array<{
    actor: string;
    permission: string;
  }>;
  data: any;
  action_ordinal: number;
  global_sequence: string;
  account_ram_deltas: Array<{
    account: string;
    delta: number;
  }>;
  console: string;
  receipt: {
    receiver: string;
    act_digest: string;
    global_sequence: string;
    recv_sequence: string;
    auth_sequence: Array<{
      account: string;
      sequence: string;
    }>;
    code_sequence: number;
    abi_sequence: number;
  };
  creator_action_ordinal: number;
  context_free: boolean;
  elapsed: number;
}

export type IExtendedTable = ITable;

export interface IExtendedAction extends IAction {
  user: IIndividualData | IEntrepreneurData | IOrganizationData | null;
}

export interface IComplexStatement {
  action: IExtendedAction;
  document: IGeneratedDocument;
}

export interface IComplexDecision {
  action: IExtendedAction;
  document: IGeneratedDocument;
  votes_for: IExtendedAction[];
  votes_against: IExtendedAction[];
}

export interface IComplexAct {
  action?: IExtendedAction;
  document?: IGeneratedDocument;
}

export interface IComplexDocument {
  statement: IComplexStatement;
  decision: IComplexDecision;
  acts: IComplexAct[];
}

export interface IGetComplexDocuments {
  results: IComplexDocument[];
  page: number;
  limit: number;
}

export interface IAgenda {
  row: SovietContract.Tables.Decisions.IDecision;
  action: IAction;
}

export interface IComplexAgenda extends IAgenda {
  document: IComplexDocument;
}
