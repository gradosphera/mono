import type { Zeus } from '@coopenomics/sdk';

// Типы на основе CreateIndividualDataInput из бэкенда
export type ICreateIndividualData = Omit<Zeus.ModelTypes['CreateIndividualDataInput'], 'email'> & {
  email?: string;
};
