import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { TextEncoder, TextDecoder } from 'util';
import fetch from 'isomorphic-fetch';
import EosApi from 'eosjs-api';
import getInternalAction from '../utils/getInternalAction';
import { GatewayContract, RegistratorContract, SovietContract } from 'cooptypes';
import { IUser } from '../models/user.model';
import { GetAccountResult, GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';
import config from '../config/config';
import TempDocument, { tempdocType } from '../models/tempDocument.model';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

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

/**
 * Получить инстанс для осуществления транзакции в блокчейн.
 * @param {username} - авторизация от аккаунта
 * @param {wif} - приватный ключ от аккаунта
 * @returns {eosjs-api}
 */

async function getInstance(wif) {
  const signatureProvider = new JsSignatureProvider([wif]);
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  return api;
}

function getApi() {
  const options = {
    httpEndpoint: process.env.BLOCKCHAIN_RPC, // default, null for cold-storage
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

async function registerBlockchainAccount(user: IUser, orderData: GatewayContract.Actions.CompleteDeposit.ICompleteDeposit) {
  const eos = await getInstance(process.env.SERVICE_WIF);

  const newaccount: RegistratorContract.Actions.CreateAccount.ICreateAccount = {
    registrator: process.env.COOPNAME as string,
    coopname: process.env.COOPNAME as string,
    referer: user.referer ? user.referer : '',
    username: user.username,
    public_key: user.public_key,
    meta: '',
  };

  const registerUserData: RegistratorContract.Actions.RegisterUser.IRegistrerUser = {
    coopname: process.env.COOPNAME as string,
    registrator: process.env.COOPNAME as string,
    username: user.username,
    type: user.type,
  };

  const statement = await TempDocument.findOne({ username: user.username, type: tempdocType.JoinStatement });
  if (!statement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено заявление на вступление');

  const joinCooperativeData: RegistratorContract.Actions.JoinCooperative.IJoinCooperative = {
    coopname: process.env.COOPNAME as string,
    registrator: process.env.COOPNAME as string,
    username: user.username,
    document: { ...statement.document, meta: JSON.stringify(statement.document.meta) },
  };

  //TODO добавить здесь соглашений
  const walletAgreement = await TempDocument.findOne({ username: user.username, type: tempdocType.WalletAgreement });
  if (!walletAgreement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено заявление на вступление');

  const walletAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname: process.env.COOPNAME as string,
    administrator: process.env.COOPNAME as string,
    username: user.username,
    agreement_type: 'wallet',
    document: { ...walletAgreement.document, meta: JSON.stringify(walletAgreement.document.meta) },
  };

  const privacyAgreement = await TempDocument.findOne({ username: user.username, type: tempdocType.PrivacyAgreement });
  if (!privacyAgreement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено соглашение о политике конфиденциальности');

  const privacyAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname: process.env.COOPNAME as string,
    administrator: process.env.COOPNAME as string,
    username: user.username,
    agreement_type: 'privacy',
    document: { ...privacyAgreement.document, meta: JSON.stringify(privacyAgreement.document.meta) },
  };

  const signatureAgreement = await TempDocument.findOne({ username: user.username, type: tempdocType.SignatureAgreement });
  if (!signatureAgreement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено соглашение о правилах использования ЭЦП');

  const signatureAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname: process.env.COOPNAME as string,
    administrator: process.env.COOPNAME as string,
    username: user.username,
    agreement_type: 'signature',
    document: { ...signatureAgreement.document, meta: JSON.stringify(signatureAgreement.document.meta) },
  };

  const userAgreement = await TempDocument.findOne({ username: user.username, type: tempdocType.UserAgreement });
  if (!userAgreement) throw new ApiError(httpStatus.BAD_REQUEST, 'Не найдено подписанное пользовательское соглашение');

  const userAgreementData: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement = {
    coopname: process.env.COOPNAME as string,
    administrator: process.env.COOPNAME as string,
    username: user.username,
    agreement_type: 'user',
    document: { ...userAgreement.document, meta: JSON.stringify(userAgreement.document.meta) },
  };

  const actions = [
    {
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.CreateAccount.actionName,
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data: newaccount,
    },
    {
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.RegisterUser.actionName, //reguser
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data: registerUserData,
    },
    {
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.JoinCooperative.actionName,
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data: joinCooperativeData,
    },
    {
      account: GatewayContract.contractName.production,
      name: GatewayContract.Actions.CompleteDeposit.actionName,
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data: orderData,
    },
    {
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data: walletAgreementData,
    },
    {
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data: signatureAgreementData,
    },
    {
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data: privacyAgreementData,
    },
    {
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: process.env.COOPNAME as string,
          permission: 'active',
        },
      ],
      data: userAgreementData,
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

  console.dir(result, { depth: null });
}

async function createBoard(data: SovietContract.Actions.Boards.CreateBoard.ICreateboard) {
  const eos = await getInstance(config.service_wif);

  console.log('data: ', data);

  const actions = [
    {
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Boards.CreateBoard.actionName,
      authorization: [
        {
          actor: config.service_username,
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
  const eos = await getInstance(process.env.SERVICE_WIF);

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

  const order_id = getInternalAction(result, 'newdepositid').id;

  return order_id;
}

async function completeOrder(data: GatewayContract.Actions.CompleteDeposit.ICompleteDeposit) {
  const eos = await getInstance(process.env.SERVICE_WIF);

  const actions = [
    {
      account: GatewayContract.contractName.production,
      name: GatewayContract.Actions.CompleteDeposit.actionName,
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

async function failOrder(data) {
  const eos = await getInstance(process.env.SERVICE_WIF);

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
  const eos = await getInstance(config.service_wif);

  const actions = [
    {
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.AddUser.actionName,
      authorization: [
        {
          actor: config.service_username,
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
  const eos = await getInstance(config.service_wif);

  const actions = [
    {
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.ChangeKey.actionName,
      authorization: [
        {
          actor: config.service_username,
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
  completeOrder,
  getSoviet,
  getBlockchainInfo,
  getBlockchainAccount,
  hasActiveKey,
  createBoard,
};
