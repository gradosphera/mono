import type { Zeus } from '@coopenomics/sdk';

// Типы на основе CreateEntrepreneurDataInput из бэкенда
export type ICreateEntrepreneurData = Omit<Zeus.ModelTypes['CreateEntrepreneurDataInput'], 'email'> & {
  email?: string;
};
