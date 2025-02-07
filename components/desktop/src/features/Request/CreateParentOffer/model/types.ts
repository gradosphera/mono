import { IRequestObjectData } from 'src/entities/Request';

export interface ICreateOffer {
  username: string;
  coopname: string;
  program_id: string | number;
  units: string | number;
  unit_cost: string;
  product_lifecycle_secs: string | number;
  data: IRequestObjectData;
}

export interface IFormData {
  title: string;
  description: string;
  units: number;
  unit_cost_number: number;
  product_lifecycle_days: number;
  program_id: number;
  preview: string;
  images: string[];
}
