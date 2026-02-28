import { Zeus } from '@coopenomics/sdk';

export type ICreateEntrepreneurData = Omit<Zeus.ModelTypes['CreateEntrepreneurDataInput'], 'email'> & {
  email?: string;
};
