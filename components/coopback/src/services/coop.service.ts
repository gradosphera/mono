import { getActions } from '../utils/getFetch';
import { generator } from './data.service';
import { userService, blockchainService } from './index';
import { Cooperative, SovietContract } from 'cooptypes';

const loadAgenda = async (coopname: string): Promise<Cooperative.Documents.IAgenda[]> => {
  const api = await blockchainService.getApi();

  const decisions = (await blockchainService.lazyFetch(
    api,
    process.env.SOVIET_CONTRACT as string,
    coopname,
    'decisions'
  )) as SovietContract.Tables.Decisions.IDecision[];

  const agenda = [] as Cooperative.Documents.IAgenda[];

  for (const table of decisions) {
    const action = (
      await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
        filter: JSON.stringify({
          account: process.env.SOVIET_CONTRACT,
          name: SovietContract.Actions.Registry.NewSubmitted.actionName,
          receiver: process.env.COOPNAME,
          'data.decision_id': String(table.id),
        }),
        page: 1,
        limit: 1,
      })
    )?.results[0];

    if (action) agenda.push({ table, action });
  }
  return agenda;
};

const loadStaff = async (coopname) => {
  const api = await blockchainService.getApi();

  const staff = await blockchainService.lazyFetch(api, process.env.SOVIET_CONTRACT, coopname, 'staff');

  for (const staf of staff) {
    const user = await userService.getUserByUsername(staf.username);

    if (user) {
      staf.user = user.toJSON();
      staf.user.private_data = await user.getPrivateData();
    }
  }

  return staff;
};

const loadMembers = async (coopname) => {
  // const api = await blockchainService.getApi()
  // const soviet = (await blockchainService.lazyFetch(
  //   api,
  //   process.env.SOVIET_CONTRACT,
  //   coopname,
  //   'boards',
  //   "soviet",
  //   "soviet",
  //   1,
  //   'i64',
  //   2
  // ))[0]
  // for (const member of soviet.members) {
  //   const user = await userService.getUserByUsername(member.username)
  //   if (user) {
  //     member.is_organization = user.is_organization
  //     member.user_profile = user.user_profile
  //     member.org_profile = user.organization_profile
  //   }
  // }
  // return soviet.members
};

const loadSoviet = async (api, coopname) => {
  const [soviet] = await blockchainService.lazyFetch(
    api,
    process.env.SOVIET_CONTRACT,
    coopname,
    'boards',
    'soviet',
    'soviet',
    1,
    'i64',
    2
  );

  soviet.chairman = soviet.members.find((el) => el.position == 'chairman').username;

  return soviet;
};

const getDecision = async (api, coopname, decision_id) => {
  const [decision] = await blockchainService.lazyFetch(
    api,
    process.env.SOVIET_CONTRACT,
    coopname,
    'decisions',
    decision_id,
    decision_id,
    1
  );

  return decision;
};

export { loadAgenda, loadStaff, loadMembers, getDecision };
