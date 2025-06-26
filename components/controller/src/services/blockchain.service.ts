import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import fetch from 'isomorphic-fetch';
import EosApi from 'eosjs-api';
import getInternalAction from '../utils/getInternalAction';
import { GatewayContract, RegistratorContract, SovietContract, WalletContract, type SystemContract } from 'cooptypes';
import { GetAccountResult, GetInfoResult } from 'eosjs/dist/eosjs-rpc-interfaces';
import config from '../config/config';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import type { IBCAction } from '../types';
import Vault from '../models/vault.model';
import { sha256 } from '~/utils/sha256';

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

async function createBoard(data: SovietContract.Actions.Boards.CreateBoard.ICreateboard) {
  const eos = await getInstance(config.coopname);

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

export async function addUser(data: RegistratorContract.Actions.AddUser.IAddUser) {
  const eos = await getInstance(config.coopname);

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

export async function cancelOrder(data: GatewayContract.Actions.DeclineIncome.IDeclineIncome) {
  const action: IBCAction<GatewayContract.Actions.DeclineIncome.IDeclineIncome> = {
    account: GatewayContract.contractName.production,
    name: GatewayContract.Actions.DeclineIncome.actionName,
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

export {
  getInstance,
  getApi,
  lazyFetch,
  createOrder,
  getCooperative,
  getBlockchainInfo,
  getBlockchainAccount,
  hasActiveKey,
  createBoard,
};
