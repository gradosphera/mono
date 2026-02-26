import { IRequestObjectData } from 'app/extensions/market/entities/Request';

export type IUpdateRequestData = {
  coopname: string;
  username: string;
  requestId: string | number;
  remainUnits: string | number;
  unitCost: string;
  data: IRequestObjectData | null;
};
