import { Zeus } from '@coopenomics/sdk';

export type ICreateIndividualData = Omit<Zeus.ModelTypes['CreateIndividualDataInput'], 'email'> & {
  email?: string;
};
