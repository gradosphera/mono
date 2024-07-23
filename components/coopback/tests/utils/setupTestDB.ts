import mongoose from 'mongoose';
import config from '../../src/config/config';
import { connectGenerator, generator } from '../../src/services/data.service';

export const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    await connectGenerator();
  });

  beforeEach(async () => {
    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await generator.disconnect();
  });
};
