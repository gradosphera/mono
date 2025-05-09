import config from '../config/config';
import { Generator } from '@coopenomics/factory';
import type { IGenerate } from '../types';

export const generator = new Generator();

export const connectGenerator = async () => {
  await generator.connect(config.mongoose.url);
};

export const diconnectGenerator = async () => {
  await generator.disconnect();
};

export const generateDocument = async (body: IGenerate) => {
  return await generator.generate(body.data, body.options);
};
