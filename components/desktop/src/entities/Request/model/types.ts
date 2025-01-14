import { MarketContract } from 'cooptypes';

type Request = MarketContract.Tables.Requests.IRequest;

export interface IRequestObjectData {
  title: string;
  description: string;
  preview: string;
  images: Array<string>;
}

export interface IRequestData
  extends Omit<Request, 'data' | 'created_at' | 'expired_at'> {
  data: IRequestObjectData;
  created_at: Date;
  expired_at: Date;
}

export interface IUpdateOneRequest {
  coopname: string;
  request_id: string | number;
}

export interface ILoadAllRequests {
  coopname: string;
}

export interface ILoadAllParentOffers {
  coopname: string;
}

export interface ILoadAllChildOrders {
  coopname: string;
}

export interface ILoadUserParentOffers {
  coopname: string;
  username: string;
}

export interface ILoadUserChildOrders {
  coopname: string;
  username: string;
}

enum ClearList {
  /** Список типов для очищения заявок в маркетплейсе */
  allRequests = 'allRequests',
  allParentOffers = 'allParentOffers',
  allChildOrders = 'allChildOrders',
  userParentOffers = 'userParentOffers',
  userChildOrders = 'userChildOrders',
}

export interface IClearRequests {
  target: ClearList;
}
