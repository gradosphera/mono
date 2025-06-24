import type { MeetContract } from 'cooptypes'

const meetValue: MeetContract.Tables.Meets.IOutput = {
  id: '14',
  hash: 'TEST_MEET_HASH_12345',
  coopname: 'voskhod',
  type: 'regular',
  level: 'cooperative',
  initiator: 'ant',
  presider: 'ant',
  secretary: 'ant',
  status: 'created',
  created_at: '2025-06-23T12:31:46.000',
  open_at: '2025-06-23T12:20:00.000',
  close_at: '2025-06-23T12:22:00.000',
  notified_users: [],
  quorum_percent: 75,
  signed_ballots: '100',
  current_quorum_percent: 0,
  cycle: '1',
  quorum_passed: false,
  proposal: {
    version: '1.0.0',
    hash: '0EADEE40FCCBA221729FA5F5719F973E7BA90B2CA04841A9778D2A9F17F7F590',
    doc_hash: 'C2EFB045E14EA76FC220102EEB2F13F38E771B74F4EE22EB7BDA66C70FD34530',
    meta_hash: '45D1F9A527D32A84295BD59D61FA28CB5162CD0BE179423926AE44F9CA84AA00',
    meta: '{"block_num":1700158,"coopname":"voskhod","created_at":"23.06.2025 15:31","generator":"coopjs","is_repeated":false,"lang":"ru","links":[],"meet":{"close_at_datetime":"23.06.2025 15:22 (Мск)","open_at_datetime":"23.06.2025 15:20 (Мск)","type":"regular"},"questions":[{"context":"Тут приложения к вопросу","decision":"Тут проект решения по вопросу","number":"1","title":"Тестовый вопрос"}],"registry_id":300,"timezone":"Europe/Moscow","title":"Предложение повестки дня общего собрания","username":"ant","version":"2025.6.19"}',
    signatures: [
      {
        id: 1,
        signed_hash: 'B452BB6063CF5DBBDF9E30EB1D2BA64CB65265C8C311DD5013C1237FA4327CDF',
        signer: 'ant',
        public_key: 'PUB_K1_6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5BoDq63',
        signature: 'SIG_K1_Kd6HWvecCZ1nmSZyvy3c2B9Rkvj3Y8tiv8yubXEK7V46E2ERUZSpLoedASi6vCwJQcu3cUK1WzR4oxbYKPRbvnom3QfZLa',
        signed_at: '2025-06-23T12:31:45.000',
        meta: '{}',
      },
    ],
  },
  authorization: {
    version: '',
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
    doc_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    meta_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    meta: '',
    signatures: [],
  },
  decision1: {
    version: '',
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
    doc_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    meta_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    meta: '',
    signatures: [],
  },
  decision2: {
    version: '',
    hash: '0000000000000000000000000000000000000000000000000000000000000000',
    doc_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    meta_hash: '0000000000000000000000000000000000000000000000000000000000000000',
    meta: '',
    signatures: [],
  },
}

const meetTableFull = {
  _id: '685949339bd56240ad71b34f',
  chain_id: 'f50256680336ee6daaeee93915b945c1166b5dfc98977adcb717403ae225c559',
  block_num: 1700165,
  block_id: '0019F1455FEF5180A7106C1F80FB651C0FC1B7596A83FA33E4774C525929A0E4',
  present: true,
  code: 'meet',
  scope: 'voskhod',
  table: 'meets',
  primary_key: '14',
  value: meetValue,
}

export const meetTableMock = {
  code: 'meet',
  table: 'meets',
  value: { 'value.hash': 'TEST_MEET_HASH_12345' },
  data: {
    results: [meetTableFull],
  },
  match: ((_url: string, _params?: URLSearchParams) => false) as (url: string, params?: URLSearchParams) => boolean,
} as any
