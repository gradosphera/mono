import { Zeus } from '@coopenomics/sdk';

export type ICreateOrganizationData = Omit<Zeus.ModelTypes['CreateOrganizationDataInput'], 'email'> & {
  email?: string;
};
