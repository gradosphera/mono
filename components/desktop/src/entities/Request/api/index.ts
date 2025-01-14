import { fetchTable } from '../../../shared/api';
import {
  ContractsList,
  LimitsList,
  SecondaryIndexesNumbers,
  TablesList,
} from '../../../shared/config';
import { ILoadAllRequests, IUpdateOneRequest } from '../model';
import type {
  IRequestData,
  IRequestObjectData,
  ILoadAllParentOffers,
  ILoadUserParentOffers,
  ILoadUserChildOrders,
} from '../model';

function parseRequestObjectData(data: string): IRequestObjectData {
  try {
    return JSON.parse(data) as IRequestObjectData;
  } catch (e) {
    console.error(e); // Логирование ошибки может быть полезным
    return {} as IRequestObjectData;
  }
}

async function loadAllRequests(
  params: ILoadAllRequests
): Promise<IRequestData[]> {
  const requests = (await fetchTable(
    ContractsList.Marketplace,
    params.coopname,
    TablesList.CoopMarketRequests
  )) as any[];

  requests.map((el) => (el.data = parseRequestObjectData(el.data)));

  return requests as IRequestData[];
}

async function loadOneRequest(
  params: IUpdateOneRequest
): Promise<IRequestData> {
  const request = (
    await fetchTable(
      ContractsList.Marketplace,
      params.coopname,
      TablesList.CoopMarketRequests,
      params.request_id,
      params.request_id,
      1
    )
  )[0] as any;

  // если есть родительская заявка, то получаем данные из неё, потому что в дочернией заявке data не множится
  if (request.parent_id !== 0) {
    const parent_request = (
      (await fetchTable(
        ContractsList.Marketplace,
        params.coopname,
        TablesList.CoopMarketRequests,
        request.parent_id,
        request.parent_id,
        1
      )) as any
    )[0];
    request.data = parseRequestObjectData(parent_request.data);
  } else {
    request.data = parseRequestObjectData(request.data);
  }

  return request as IRequestData;
}

async function loadAllParentOffers(
  params: ILoadAllParentOffers
): Promise<IRequestData[]> {
  const requests = (await fetchTable(
    ContractsList.Marketplace,
    params.coopname,
    TablesList.CoopMarketRequests,
    0,
    0,
    LimitsList.None,
    SecondaryIndexesNumbers.Six
  )) as any[];

  requests.map((el) => (el.data = parseRequestObjectData(el.data)));

  return requests as IRequestData[];
}

async function loadAllChildOrders(
  params: ILoadAllParentOffers
): Promise<IRequestData[]> {
  const child_requests = (
    (await fetchTable(
      ContractsList.Marketplace,
      params.coopname,
      TablesList.CoopMarketRequests,
      1,
      -1,
      LimitsList.None,
      SecondaryIndexesNumbers.Six
    )) as any[]
  ).filter((el) => el.type === 'order'); //фильтр возможно избыточный

  for (const child_request of child_requests) {
    const parent_request = await loadOneRequest({
      coopname: child_request.coopname,
      request_id: child_request.id,
    } as IUpdateOneRequest);
    child_request.data = parent_request.data;
  }
  return child_requests as IRequestData[];
}

async function loadUserParentOffers(
  params: ILoadUserParentOffers
): Promise<IRequestData[]> {
  const requests = (
    (await fetchTable(
      ContractsList.Marketplace,
      params.coopname,
      TablesList.CoopMarketRequests,
      params.username,
      params.username,
      LimitsList.None,
      SecondaryIndexesNumbers.Seven
    )) as any[]
  ).filter((el) => el.parent_id == 0);

  requests.map((el) => (el.data = parseRequestObjectData(el.data)));

  return requests as IRequestData[];
}

async function loadUserChildOrders(
  params: ILoadUserChildOrders
): Promise<IRequestData[]> {
  let result = [] as any[];
  //получаем входящие заявки на открытые заявки пользователя
  //  получаем встречные заявки, в которых пользователь - родитель
  const user_incoming_requests = (
    (await fetchTable(
      ContractsList.Marketplace,
      params.coopname,
      TablesList.CoopMarketRequests,
      params.username,
      params.username,
      LimitsList.None,
      SecondaryIndexesNumbers.Eight
    )) as any[]
  ).filter((el) => el.parent_id > 0); //возможно фильтр лишний

  //TODO получить родительские заявки самого пользователя как происходит ниже
  result = result.concat(user_incoming_requests);

  //получаем исходящие заявки пользователя
  const user_outcoming_requests = (
    (await fetchTable(
      ContractsList.Marketplace,
      params.coopname,
      TablesList.CoopMarketRequests,
      params.username,
      params.username,
      LimitsList.None,
      SecondaryIndexesNumbers.Seven
    )) as any[]
  ).filter((el) => el.parent_id > 0); //возможно фильтр лишний

  result = result.concat(user_outcoming_requests);

  //получаем данные о содержании заявки из родителя для всех ранее полученных встречных заявок
  //нам это нужно потому что во встречных заявках не содержится текст объявления - он только в открытых
  for (const child_request of result) {
    const parent_request = await loadOneRequest({
      coopname: child_request.coopname,
      request_id: child_request.id,
    } as IUpdateOneRequest);
    child_request.data = parent_request.data;
  }
  return result as IRequestData[];
}

export const api = {
  loadAllRequests,
  loadOneRequest,
  loadAllParentOffers,
  loadAllChildOrders,
  loadUserParentOffers,
  loadUserChildOrders,
};
