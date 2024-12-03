import type { ModelTypes } from '@coopenomics/coopjs/index';

export type ISystemInfo = Omit<ModelTypes['Extension'], 'schema'> & {
  schema?: any;
};
