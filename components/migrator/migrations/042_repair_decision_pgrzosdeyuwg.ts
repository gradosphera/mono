import { Migration } from '../src/migration_interface';
import { api } from '../src/eos';
import { SovietContract } from 'cooptypes';

export class RepairDecisionPgrzosdeyuwgMigration implements Migration {
  async run(): Promise<void> {
    try {
      await api.transact(
        {
          actions: [
            {
              account: SovietContract.contractName.production,
              name: 'repairdec',
              authorization: [
                {
                  actor: 'soviet',
                  permission: 'active',
                },
              ],
              data: {
                coopname: 'pgrzosdeyuwg',
                decision_id: '26',
                username: 'ilgugrbxmkay',
                type: 'joincoop',
                batch_id: '0',
                statement: {
                  version: '1.0.0',
                  hash: 'FC4B18A16149A81BC86F8E8AAD3C30558B03FD38A24EC707EF4BB4A8AAAF2B5E',
                  doc_hash: '59526CD0D51B29813C33AFE4EB1DE625752B46357440115C9E2DB6458E823B47',
                  meta_hash: '2FACD92DE599FACB6D90B3197D8BA96AED2E2A38404A72EF7BFE2B5A96FDEA01',
                  meta: '{"block_num":89109319,"braname":"vyxijfaotxow","coopname":"pgrzosdeyuwg","created_at":"22.12.2025 17:11","generator":"coopjs","lang":"ru","links":["77862C8533545012ED2782593FECCFAC388CA814906745AAC0B8788187EC3AF5","F9FFA68850ACAA431DA20C1CD3434E21FC400E6122BDD79E9775B1116872C33B","531613045E4B7A4FDD4A802F0AB1262362DC26AD72DEF18685E7E0A85B4638CF","5B602BFC5D2B1B24683285E1567410B9FA68D07215EBA35E31583AF5FB4D2B9F"],"registry_id":100,"skip_save":false,"timezone":"Europe/Moscow","title":"Заявление на вступление в кооператив","username":"ilgugrbxmkay","version":"2025.12.22-2"}',
                  signatures: [
                    {
                      id: 1,
                      signed_hash: '757BAC7ECEFF9A8C07E092D9042FCB4223615CFA40450558A508064E42FCF2FA',
                      signer: 'ilgugrbxmkay',
                      public_key: 'PUB_K1_5DaTtKH269gnQBw3LRgEvkjeRNuidyqt9w7CmNvogqX9VgDYta',
                      signature: 'SIG_K1_KWSJBEuTw48tPERqjSfr2eC2MRWbGG5fwfmau6dB7bgJCgBRx32rJpqUjkRY13imYqxm41iD5KAwfQgJt2Tz49PCf66pFY',
                      signed_at: '2025-12-22T14:11:18.000',
                      meta: '{}'
                    }
                  ]
                },
                votes_for: ['vmfmdqhhglvl'],
                votes_against: [],
                validated: false,
                approved: false,
                authorized: false,
                authorized_by: '',
                authorization: {
                  version: '',
                  hash: '0000000000000000000000000000000000000000000000000000000000000000',
                  doc_hash: '0000000000000000000000000000000000000000000000000000000000000000',
                  meta_hash: '0000000000000000000000000000000000000000000000000000000000000000',
                  meta: '',
                  signatures: []
                },
                created_at: '2025-12-23T08:10:07.000',
                expired_at: '2025-12-26T08:10:07.000',
                meta: '',
                callback_contract: 'registrator',
                confirm_callback: 'confirmreg',
                decline_callback: 'declinereg',
                hash: '984A13DF5E43C31CC1D572AA4628557F52C67F409FDA27ACBED4D15B9A02041E'
              },
            },
          ],
        },
        {
          blocksBehind: 3,
          expireSeconds: 30,
        }
      );

      console.log('Decision repair completed successfully');
    } catch (error) {
      console.error('Error during decision repair migration:', error);
      throw error;
    }
  }
}
