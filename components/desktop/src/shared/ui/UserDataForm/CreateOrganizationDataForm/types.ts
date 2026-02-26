import type { Zeus } from '@coopenomics/sdk';

// Типы на основе CreateOrganizationDataInputDTO из бэкенда
export type ICreateOrganizationData = Omit<Zeus.ModelTypes['CreateOrganizationDataInput'], 'email'> & {
  email?: string;
};
