import { SovietContract, RegistratorContract } from 'cooptypes';
import { IAction, ITable } from '../../src/types/common';
import mongoose from 'mongoose';
import { Cooperative } from 'cooptypes';

export const insertAction = async (action: IAction) => {
  const collection = mongoose.connection.db.collection('actions'); // Замените на имя вашей коллекции
  await collection.insertOne(action);
};

export const insertActions = async (actions: IAction[]) => {
  const collection = mongoose.connection.db.collection('actions'); // Замените на имя вашей коллекции
  await collection.insertMany(actions);
};

export const insertDelta = async (delta: ITable) => {
  const collection = mongoose.connection.db.collection('deltas'); // Замените на имя вашей коллекции
  await collection.insertOne(delta);
};

export const fixtureVoskhod = (): Cooperative.Users.IOrganizationData => {
  return {
    username: 'voskhod',
    type: 'coop',
    is_cooperative: true,
    short_name: 'Voskhod',
    full_name: 'ПК ВОСХОД',
    represented_by: {
      first_name: 'Алексей',
      last_name: 'Муравьев',
      middle_name: 'Николаевич',
      position: 'Председатель',
      based_on: 'Решения общего собрания №1',
    },
    country: 'Russia',
    city: 'Moscow',
    full_address: '123 Main St, Moscow, Russia',
    email: 'contact@orgco.com',
    phone: '+71234567890',
    details: {
      inn: '1234567890',
      ogrn: '1234567890123',
    },
    bank_account: {
      account_number: '40817810099910004312',
      currency: 'RUB',
      card_number: '1234567890123456',
      bank_name: 'Sberbank',
      details: {
        bik: '123456789',
        corr: '30101810400000000225',
        kpp: '123456789',
      },
    },
  };
};

export const installInitialCooperativeData = async () => {
  const delta1 = fixtureDelta(0, 'registrator', 'registrator', 'orgs', '1', {
    username: 'voskhod',
    parent_username: '',
    announce: '',
    description: '',
    is_cooperative: true,
    is_branched: false,
    coop_type: 'conscoop',
    registration: '2.0000 RUB',
    initial: '1.0000 RUB',
    minimum: '1.0000 RUB',
  } as RegistratorContract.Tables.Organizations.IOrganization);

  await insertDelta(delta1);

  const delta2 = fixtureDelta(0, 'soviet', 'voskhod', 'boards', '1', {
    id: '0',
    type: 'soviet',
    name: 'Совет провайдера',
    description: '',
    members: [
      {
        username: 'ant',
        is_voting: true,
        position_title: 'Председатель',
        position: 'chairman',
      },
    ],
    created_at: '2024-05-15T10:45:42.000',
    last_update: '2024-05-15T10:45:42.000',
  } as SovietContract.Tables.Boards.IBoards);

  await insertDelta(delta2);
};

export const fixtureDelta = (
  block_num: number,
  code: string,
  scope: string,
  table: string,
  primary_key: string,
  value: any
): ITable => {
  return {
    chain_id: '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f',
    block_num: block_num,
    block_id: '0000004638245B61DFC24802CC306C593B454A4022A3D2BC8068F7818D72826F',
    present: 'true',
    code: code,
    scope: scope,
    table: table,
    primary_key: primary_key,
    value: value,
  };
};

export const fixtureAction = (
  block_num: number,
  name: string,
  username: string,
  coopname: string,
  contract: string,
  data: any
): IAction[] => {
  return [
    {
      chain_id: '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f',
      block_id: '0000004638245B61DFC24802CC306C593B454A4022A3D2BC8068F7818D72826F',
      block_num: block_num,
      transaction_id: '20CE2EF76A92FCD88501FF54678E92446B8F88A81188E12725CDBEC8600C32A3',
      global_sequence: '0',
      receipt: {
        receiver: username,
        act_digest: '5C87EC9325D130A0DF4137CD52223F763F1CCE86BB47C441432340466FC09922',
        global_sequence: '0',
        recv_sequence: '0',
        auth_sequence: [
          {
            account: contract,
            sequence: '0',
          },
        ],
        code_sequence: 1,
        abi_sequence: 1,
      },
      account: contract,
      name: name,
      authorization: [
        {
          actor: contract,
          permission: 'active',
        },
      ],
      data: data,
      action_ordinal: 0,
      creator_action_ordinal: 0,
      receiver: username,
      context_free: false,
      elapsed: 0,
      console: '',
      account_ram_deltas: [],
    },

    {
      chain_id: '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f',
      block_id: '0000004638245B61DFC24802CC306C593B454A4022A3D2BC8068F7818D72826F',
      block_num: block_num,
      transaction_id: '20CE2EF76A92FCD88501FF54678E92446B8F88A81188E12725CDBEC8600C32A3',
      global_sequence: '0',
      receipt: {
        receiver: contract,
        act_digest: '5C87EC9325D130A0DF4137CD52223F763F1CCE86BB47C441432340466FC09922',
        global_sequence: '0',
        recv_sequence: '0',
        auth_sequence: [
          {
            account: contract,
            sequence: '0',
          },
        ],
        code_sequence: 1,
        abi_sequence: 1,
      },
      account: contract,
      name: 'newsubmitted',
      authorization: [
        {
          actor: contract,
          permission: 'active',
        },
      ],
      data: data,
      action_ordinal: 0,
      creator_action_ordinal: 0,
      receiver: contract,
      context_free: false,
      elapsed: 0,
      console: '',
      account_ram_deltas: [],
    },

    {
      chain_id: '8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f',
      block_id: '0000004638245B61DFC24802CC306C593B454A4022A3D2BC8068F7818D72826F',
      block_num: block_num,
      transaction_id: '20CE2EF76A92FCD88501FF54678E92446B8F88A81188E12725CDBEC8600C32A3',
      global_sequence: '0',
      receipt: {
        receiver: coopname,
        act_digest: '5C87EC9325D130A0DF4137CD52223F763F1CCE86BB47C441432340466FC09922',
        global_sequence: '0',
        recv_sequence: '0',
        auth_sequence: [
          {
            account: contract,
            sequence: '0',
          },
        ],
        code_sequence: 1,
        abi_sequence: 1,
      },
      account: contract,
      name: 'newsubmitted',
      authorization: [
        {
          actor: contract,
          permission: 'active',
        },
      ],
      data: data,
      action_ordinal: 0,
      creator_action_ordinal: 0,
      receiver: coopname,
      context_free: false,
      elapsed: 0,
      console: '',
      account_ram_deltas: [],
    },
  ];
};
