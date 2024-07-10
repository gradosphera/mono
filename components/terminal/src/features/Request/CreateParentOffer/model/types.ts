import { IRequestObjectData } from 'src/entities/Request';

export interface ICreateOffer {
  username: string;
  coopname: string;
  program_id: string | number;
  pieces: string | number;
  unit_cost: string;
  product_lifecycle_secs: string | number;
  data: IRequestObjectData;
}

export interface IFormData {
  title: string;
  description: string;
  pieces: number;
  unit_cost_number: number;
  product_lifecycle_days: number;
  program_id: number;
  preview: string;
  images: string[];
}
