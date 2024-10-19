import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import fetch from 'isomorphic-fetch';
import EosApi from 'eosjs-api';
import getInternalAction from '../utils/getInternalAction';
import { GatewayContract, RegistratorContract, SovietContract, type SystemContract } from 'cooptypes';
import { IUser } from '../types/user.types';
import { GetAccountResult, GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';
import config from '../config/config';
import TempDocument, { tempdocType } from '../models/tempDocument.model';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import type { IOrder } from '../types/order.types';
import type { IBCAction } from '../types';
import Vault from '../models/vault.model';

const rpc = new JsonRpc(process.env.BLOCKCHAIN_RPC as string, { fetch });

function hasActiveKey(account, publicKey) {
  const activePermissions = account.permissions.find((p: any) => p.perm_name === 'active');
  if (!activePermissions) return false;

  return activePermissions.required_auth.keys.some((key: any) => key.key === publicKey);
}

async function getBlockchainInfo(): Promise<GetInfoResult> {
  const api = getApi();

  return await api.getInfo({});
}

async function getBlockchainAccount(username): Promise<GetAccountResult> {
  const api = getApi();

  return await api.getAccount(username);
}

export async function transact(actions: any): Promise<any> {
  const instance = await getInstance(config.coopname);
  const result = await instance.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );

  return result;
}

/**
 * Получить инстанс для осуществления транзакции в блокчейн.
 * @param {username} - авторизация от аккаунта
 * @param {wif} - приватный ключ от аккаунта
 * @returns {eosjs-api}
 */

async function getInstance(username: string) {
  const wif = await Vault.getWif(username);

  if (!wif) throw new ApiError(httpStatus.BAD_GATEWAY, 'Не найден приватный ключ для совершения операции');

  const signatureProvider = new JsSignatureProvider([wif]);
  const api = new Api({ rpc, signatureProvider });
  return api;
}

function getApi() {
  const options = {
    httpEndpoint: process.env.BLOCKCHAIN_RPC, //
    verbose: false, // API logging
    fetchConfiguration: {},
  };

  const api = new EosApi(options);
  return api;
}

async function lazyFetch(api, code, scope, table, lower_bound?, upper_bound?, limit?, key_type?, index_position?) {
  if (!limit) limit = 10;
  if (!lower_bound && lower_bound !== '') lower_bound = 0;

  const data = await api.getTableRows({
    json: true,
    code,
    scope,
    table,
    upper_bound,
    lower_bound,
    limit,
    key_type,
    index_position,
  });

  let result = data.rows;
  if (data.more == true && limit !== 1) {
    const redata = await lazyFetch(api, code, scope, table, data.next_key, upper_bound, limit, key_type, index_position);
    result = [...result, ...redata];
    return result;
  }
  return result;
}

async function getCooperative(coopname) {
  const api = await getApi();

  const [cooperative] = await lazyFetch(
    api,
    RegistratorContract.contractName.production,
    RegistratorContract.contractName.production,
    RegistratorContract.Tables.Cooperatives.tableName,
    coopname,
    coopname,
    1
  );
  return cooperative;
}

async function registerBlockchainAccount(user: IUser, order: IOrder) {
  const eos = await getInstance(config.coopname);
  const actions = [] as any;

  // Создаем newaccount
  const newaccount: RegistratorContract.Actions.CreateAccount.ICreateAccount = {
    registrator: process.env.COOPNAME as string,
    coopname: process.env.COOPNAME as string,
    referer: user.referer ? user.referer : '',
    username: user.username,
    public_key: user.public_key,
    meta: '',
  };

  actions.push({
    account: RegistratorContract.contractName.production,
    name: RegistratorContract.Actions.CreateAccount.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: newaccount,
  });

  // Создаем registerUserData

  const registerUserData: RegistratorContract.Actions.RegisterUser.IRegistrerUser = {
    coopname: process.env.COOPNAME as string,
    registrator: process.env.COOPNAME as string,
    username: user.username,
    type: user.type,
  };

  //не следует создавать аккаунт в случаях, если он уже есть у пользователя

  actions.push({
    account: RegistratorContract.contractName.production,
    name: RegistratorContract.Actions.RegisterUser.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: registerUserData,
  });

  // Проверяем наличие заявления на вступление и создаем joinCooperativeData
  const statement = await TempDocument.findOne({ username: user.username, type: tempdocType.JoinStatement });
  if (!statement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено заявление на вступление');

  const joinCooperativeData: RegistratorContract.Actions.JoinCooperative.IJoinCooperative = {
    coopname: process.env.COOPNAME as string,
    registrator: process.env.COOPNAME as string,
    username: user.username,
    document: { ...statement.document, meta: JSON.stringify(statement.document.meta) },
  };
  actions.push({
    account: RegistratorContract.contractName.production,
    name: RegistratorContract.Actions.JoinCooperative.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: joinCooperativeData,
  });

  // Создаем createDeposit
  const createDeposit: GatewayContract.Actions.CreateDeposit.ICreateDeposit = {
    coopname: config.coopname,
    username: user.username,
    type: 'registration',
    quantity: order.quantity,
    deposit_id: order.order_num as number,
  };
  actions.push({
    account: GatewayContract.contractName.production,
    name: GatewayContract.Actions.CreateDeposit.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: createDeposit,
  });

  // Создаем completeDeposit
  const completeDeposit: GatewayContract.Actions.CompleteDeposit.ICompleteDeposit = {
    coopname: config.coopname,
    admin: config.coopname,
    deposit_id: order.order_num as number,
    memo: '',
  };
  actions.push({
    account: GatewayContract.contractName.production,
    name: GatewayContract.Actions.CompleteDeposit.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: completeDeposit,
  });

  // Проверяем наличие соглашения на кошелек и создаем walletAgreementData
  const walletAgreement = await TempDocument.findOne({ username: user.username, type: tempdocType.WalletAgreement });
  if (!walletAgreement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено заявление на вступление');

  const walletAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname: process.env.COOPNAME as string,
    administrator: process.env.COOPNAME as string,
    username: user.username,
    agreement_type: 'wallet',
    document: { ...walletAgreement.document, meta: JSON.stringify(walletAgreement.document.meta) },
  };
  actions.push({
    account: SovietContract.contractName.production,
    name: SovietContract.Actions.Agreements.SendAgreement.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: walletAgreementData,
  });

  // Проверяем наличие соглашения по ЭЦП и создаем signatureAgreementData
  const signatureAgreement = await TempDocument.findOne({ username: user.username, type: tempdocType.SignatureAgreement });
  if (!signatureAgreement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено соглашение о правилах использования ЭЦП');

  const signatureAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname: process.env.COOPNAME as string,
    administrator: process.env.COOPNAME as string,
    username: user.username,
    agreement_type: 'signature',
    document: { ...signatureAgreement.document, meta: JSON.stringify(signatureAgreement.document.meta) },
  };
  actions.push({
    account: SovietContract.contractName.production,
    name: SovietContract.Actions.Agreements.SendAgreement.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: signatureAgreementData,
  });

  // Проверяем наличие соглашения о конфиденциальности и создаем privacyAgreementData
  const privacyAgreement = await TempDocument.findOne({ username: user.username, type: tempdocType.PrivacyAgreement });
  if (!privacyAgreement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено соглашение о политике конфиденциальности');

  const privacyAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname: process.env.COOPNAME as string,
    administrator: process.env.COOPNAME as string,
    username: user.username,
    agreement_type: 'privacy',
    document: { ...privacyAgreement.document, meta: JSON.stringify(privacyAgreement.document.meta) },
  };
  actions.push({
    account: SovietContract.contractName.production,
    name: SovietContract.Actions.Agreements.SendAgreement.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: privacyAgreementData,
  });

  // Проверяем наличие пользовательского соглашения и создаем userAgreementData
  const userAgreement = await TempDocument.findOne({ username: user.username, type: tempdocType.UserAgreement });
  if (!userAgreement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено подписанное пользовательское соглашение');

  const userAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname: process.env.COOPNAME as string,
    administrator: process.env.COOPNAME as string,
    username: user.username,
    agreement_type: 'user',
    document: { ...userAgreement.document, meta: JSON.stringify(userAgreement.document.meta) },
  };
  actions.push({
    account: SovietContract.contractName.production,
    name: SovietContract.Actions.Agreements.SendAgreement.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data: userAgreementData,
  });

  const result = await eos.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );

  // console.dir(result, { depth: null });
}

async function createBoard(data: SovietContract.Actions.Boards.CreateBoard.ICreateboard) {
  const eos = await getInstance(config.coopname);

  // console.log('data: ', data);

  const actions = [
    {
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Boards.CreateBoard.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data,
    },
  ];

  await eos.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );
}

async function createOrder(data) {
  const eos = await getInstance(config.coopname);

  const actions = [
    {
      account: GatewayContract.contractName.production,
      name: 'deposit',
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data,
    },
  ];

  const result = await eos.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );

  const order_num = getInternalAction(result, 'newdepositid').id;

  return order_num;
}

async function completeDeposit(order: IOrder) {
  const eos = await getInstance(config.coopname);

  const createDeposit: GatewayContract.Actions.CreateDeposit.ICreateDeposit = {
    coopname: config.coopname,
    username: order.username,
    type: 'deposit',
    quantity: order.quantity,
    deposit_id: order.order_num as number,
  };

  const completeDeposit: GatewayContract.Actions.CompleteDeposit.ICompleteDeposit = {
    coopname: config.coopname,
    admin: config.coopname,
    deposit_id: order.order_num as number,
    memo: '',
  };

  const actions = [
    {
      account: GatewayContract.contractName.production,
      name: GatewayContract.Actions.CreateDeposit.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: createDeposit,
    },
    {
      account: GatewayContract.contractName.production,
      name: GatewayContract.Actions.CompleteDeposit.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data: completeDeposit,
    },
  ];

  await eos.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );
}

async function failOrder(data) {
  const eos = await getInstance(config.coopname);

  const actions = [
    {
      account: GatewayContract.contractName.production,
      name: 'dpfail',
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data,
    },
  ];

  await eos.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );
}

export async function addUser(data: RegistratorContract.Actions.AddUser.IAddUser) {
  const eos = await getInstance(config.coopname);
  console.log('data:', data);
  const actions = [
    {
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.AddUser.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data,
    },
  ];

  await eos.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );
}

export async function changeKey(data: RegistratorContract.Actions.ChangeKey.IChangeKey) {
  const eos = await getInstance(config.coopname);

  const actions = [
    {
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.ChangeKey.actionName,
      authorization: [
        {
          actor: config.coopname,
          permission: 'active',
        },
      ],
      data,
    },
  ];

  await eos.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );
}

export async function cancelOrder(data: GatewayContract.Actions.RefundDeposit.IRefundDeposit) {
  const action: IBCAction<GatewayContract.Actions.RefundDeposit.IRefundDeposit> = {
    account: GatewayContract.contractName.production,
    name: GatewayContract.Actions.RefundDeposit.actionName,
    authorization: [
      {
        actor: config.coopname,
        permission: 'active',
      },
    ],
    data,
  };

  return await transact([action]);
}

export async function powerUp(username: string, quantity: string): Promise<void> {
  const data: SystemContract.Actions.Powerup.IPowerup = {
    payer: username,
    receiver: username,
    days: 1,
    payment: quantity,
    transfer: false,
  };

  const actions = [
    {
      account: 'eosio',
      name: 'powerup',
      authorization: [
        {
          actor: username,
          permission: 'active',
        },
      ],
      data,
    },
  ];

  try {
    const result = await transact(actions);
    console.log('Транзакция powerup выполнена:', result);
  } catch (error) {
    console.error('Ошибка при выполнении транзакции powerup:', error);
    throw error;
  }
}

async function getSoviet(coopname) {
  const api = await getApi();

  const soviet = (await lazyFetch(api, SovietContract.contractName.production, coopname, 'boards'))[0];

  return soviet;
}

async function fetchAllParticipants() {
  const api = await getApi();

  const participants = await lazyFetch(api, SovietContract.contractName.production, process.env.COOPNAME, 'participants');
  return participants;
}

export {
  getInstance,
  getApi,
  registerBlockchainAccount,
  lazyFetch,
  fetchAllParticipants,
  createOrder,
  getCooperative,
  failOrder,
  completeDeposit,
  getSoviet,
  getBlockchainInfo,
  getBlockchainAccount,
  hasActiveKey,
  createBoard,
};
