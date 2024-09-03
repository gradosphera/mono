import { getActions } from '../utils/getFetch';
import { generator } from './document.service';
import { userService, blockchainService } from './index';
import { Cooperative, RegistratorContract, SovietContract } from 'cooptypes';
import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';
import logger from '../config/logger';

export const loadAgenda = async (coopname: string): Promise<Cooperative.Documents.IAgenda[]> => {
  const api = await blockchainService.getApi();

  const decisions = (await blockchainService.lazyFetch(
    api,
    SovietContract.contractName.production as string,
    coopname,
    'decisions'
  )) as SovietContract.Tables.Decisions.IDecision[];

  const agenda = [] as Cooperative.Documents.IAgenda[];

  for (const table of decisions) {
    const action = (
      await getActions(`${process.env.SIMPLE_EXPLORER_API}/get-actions`, {
        filter: JSON.stringify({
          account: SovietContract.contractName.production,
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

  const staff = await blockchainService.lazyFetch(api, SovietContract.contractName.production, coopname, 'staff');

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

  if (!cooperative) throw new ApiError(httpStatus.NOT_FOUND, 'Кооператив не найден');

  const api = await blockchainService.getApi();
  const coopAccount = (
    await blockchainService.lazyFetch(
      api,
      RegistratorContract.contractName.production,
      RegistratorContract.contractName.production,
      RegistratorContract.Tables.Accounts.tableName,
      coopname,
      coopname,
      1
    )
  )[0];

  if (!coopAccount) throw new ApiError(httpStatus.NOT_FOUND, 'Аккаунт не найден');

  let announce: Cooperative.Users.IAccountMeta = { phone: cooperative?.phone, email: cooperative?.email };

  if (coopAccount.meta) {
    try {
      announce = JSON.parse(coopAccount.meta);
    } catch (e: any) {
      logger.warn(`Ошибка при получении контактов: ${e.message}`);
    }
  }

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
