import { IRequestObjectData } from 'src/entities/Request';

export type IUpdateRequestData = {
  coopname: string;
  username: string;
  requestId: string | number;
  remainUnits: string | number;
  unitCost: string;
  data: IRequestObjectData | null;
};
