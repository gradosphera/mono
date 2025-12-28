/* eslint-disable */

import { ProcessEnvVars } from '../src/shared/config/env.types';

declare namespace NodeJS {
  interface ProcessEnv extends ProcessEnvVars {}
}
