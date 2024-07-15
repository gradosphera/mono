import { getActions } from '../utils/getFetch';
import { generator } from './data.service';
import { userService, blockchainService } from './index';
import { Cooperative, SovietContract } from 'cooptypes';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

export const loadAgenda = async (coopname: string): Promise<Cooperative.Documents.IAgenda[]> => {
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

export const loadStaff = async (coopname) => {
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

export const loadInfo = async (coopname: string) => {
  const cooperative: Cooperative.Model.ICooperativeData | null = await generator.constructCooperative(coopname);

  if (!cooperative) throw new ApiError(httpStatus.NO_CONTENT, 'Кооператив не найден');
  else return cooperative;
};

export const loadContacts = async (coopname: string) => {
  const cooperative: Cooperative.Model.ICooperativeData | null = await generator.constructCooperative(coopname);

  if (!cooperative) throw new Error('Кооператив не найден');

  const announce = cooperative?.announce
    ? JSON.parse(cooperative.announce)
    : { phone: cooperative?.phone, email: cooperative?.email };

  return {
    full_name: cooperative?.full_name,
    full_address: cooperative?.full_address,
    details: cooperative?.details,
    phone: announce.phone,
    email: announce.email,
    description: cooperative?.description,
    chairman: {
      first_name: cooperative?.chairman.first_name,
      last_name: cooperative?.chairman.last_name,
      middle_name: cooperative?.chairman.middle_name,
    },
  };
};
