const returnByMoneyDecisionAction = {
  _id: '6852b0389bd56240ad71b998',
  chain_id: 'f50256680336ee6daaeee93915b945c1166b5dfc98977adcb717403ae225c559',
  block_id: '000CBF518A8998507069881FF00EE74E1E2E5345CD9B3D1F34E09DA732AC1D3D',
  block_num: 835409,
  transaction_id: 'F79ED54A8D37076C3ADC73D3A10EF2A3933089D7B2B3D87F46D8703BCB34DA5B',
  global_sequence: '836089',
  receipt: {
    receiver: 'soviet',
    act_digest: '642C266D89D4FB33ACB2A41E4294A382A451F361FCD040F5D202F8D1816FBFF2',
    global_sequence: '836089',
    recv_sequence: '163',
    auth_sequence: [{ account: 'ant', sequence: '3' }],
    code_sequence: 1,
    abi_sequence: 1,
  },
  account: 'soviet',
  name: 'returnbymoneydecision',
  authorization: [{ actor: 'ant', permission: 'active' }],
  data: {
    version: '1.0.0',
    coopname: 'voskhod',
    username: 'ant',
    decision_id: '9001',
    payment_hash: 'abc123def456hash789',
    amount: '50000',
    currency: 'руб.',
    signed_at: '2025-06-18T12:25:23.000',
    signed_hash: '940734E565D3FA78527CC85C90D8601D7801F896EC5B40F6D1CC1DF0C6600948',
    signature: 'SIG_K1_KkSjs8tZtmDmTyLvaCEETVZ2QQQpshMF3ZyEjVXadNXivsAQfjbkrN6smKRoApqXjBhc5vHhL8vbSt4itAzYRbrvHF18WF',
    public_key: 'PUB_K1_52YPV66yKaju9WTXKuk8xWRSsCZ18Ewt9Z6SW24yMsRySPi2mZ',
  },
  action_ordinal: 1,
  creator_action_ordinal: 0,
  receiver: 'soviet',
  context_free: false,
  elapsed: '0',
  console: '',
  account_ram_deltas: [{ account: 'soviet', delta: '8' }],
  return_value: '',
}

// Мок для голосов "за" решение
const voteForAction9001_1 = {
  _id: '6852b0389bd56240ad71b990',
  chain_id: 'f50256680336ee6daaeee93915b945c1166b5dfc98977adcb717403ae225c559',
  block_id: '000CBF518A8998507069881FF00EE74E1E2E5345CD9B3D1F34E09DA732AC1D3D',
  block_num: 835400,
  transaction_id: 'F79ED54A8D37076C3ADC73D3A10EF2A3933089D7B2B3D87F46D8703BCB34DA5A',
  global_sequence: '836080',
  receipt: {
    receiver: 'soviet',
    act_digest: '642C266D89D4FB33ACB2A41E4294A382A451F361FCD040F5D202F8D1816FBFF1',
    global_sequence: '836080',
    recv_sequence: '160',
    auth_sequence: [{ account: 'member1', sequence: '1' }],
    code_sequence: 1,
    abi_sequence: 1,
  },
  account: 'soviet',
  name: 'votefor',
  authorization: [{ actor: 'member1', permission: 'active' }],
  data: {
    version: '1.0.0',
    coopname: 'voskhod',
    username: 'member1',
    decision_id: '9001',
    signed_at: '2025-06-18T12:20:00.000',
    signed_hash: '940734E565D3FA78527CC85C90D8601D7801F896EC5B40F6D1CC1DF0C6600940',
    signature: 'SIG_K1_KkSjs8tZtmDmTyLvaCEETVZ2QQQpshMF3ZyEjVXadNXivsAQfjbkrN6smKRoApqXjBhc5vHhL8vbSt4itAzYRbrvHF18WA',
    public_key: 'PUB_K1_52YPV66yKaju9WTXKuk8xWRSsCZ18Ewt9Z6SW24yMsRySPi2mA',
  },
  action_ordinal: 1,
  creator_action_ordinal: 0,
  receiver: 'soviet',
  context_free: false,
  elapsed: '0',
  console: '',
  account_ram_deltas: [{ account: 'soviet', delta: '8' }],
  return_value: '',
}

// Мок для голосов "против" решения (пустой массив - никто не голосовал против)
const voteAgainstAction9001: any[] = []

export const returnByMoneyDecisionActionMock = {
  code: 'soviet',
  actionName: 'returnbymoneydecision',
  value: { 'data.decision_id': '9001', 'data.coopname': 'voskhod' },
  data: {
    results: [returnByMoneyDecisionAction],
  },
  match: ((_url: string, _params?: URLSearchParams) => false) as (url: string, params?: URLSearchParams) => boolean,
}

// Мок для голосов "за"
export const voteForDecision9001Mock = {
  code: 'soviet',
  actionName: 'votefor',
  value: { 'data.decision_id': '9001', 'data.coopname': 'voskhod' },
  data: {
    results: [voteForAction9001_1],
  },
  match: ((_url: string, _params?: URLSearchParams) => false) as (url: string, params?: URLSearchParams) => boolean,
}

// Мок для голосов "против"
export const voteAgainstDecision9001Mock = {
  code: 'soviet',
  actionName: 'voteagainst',
  value: { 'data.decision_id': '9001', 'data.coopname': 'voskhod' },
  data: {
    results: voteAgainstAction9001,
  },
  match: ((_url: string, _params?: URLSearchParams) => false) as (url: string, params?: URLSearchParams) => boolean,
}
