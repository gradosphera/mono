import { IRequestData } from 'src/entities/Request';

export interface ICreateChildOrder {
  username: string;
  coopname: string;
  parent_id: string | number;
  program_id: string | number;
  units: string | number;
  unit_cost: string;
}

export interface ICreateChildOrderProps {
  username: string;
  coopname: string;
  offer: IRequestData;
  units: number;
}
