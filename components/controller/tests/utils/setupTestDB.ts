import mongoose from 'mongoose';
import config from '../../src/config/config';
import { connectGenerator, generator } from '../../src/services/document.service';

export const setupTestDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    await connectGenerator();
  });

  beforeEach(async () => {
    const db = mongoose.connection.db;
    const collections = ['IndividualData', 'OrgData', 'EntrepreneurData', 'PaymentData'];

    await Promise.all(
      collections.map(async (name) => {
        if (db) {
          const collection = db.collection(name);
          return collection.deleteMany({});
        }
      })
    );

    await Promise.all(Object.values(mongoose.connection.collections).map(async (collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await generator.disconnect();
    await mongoose.disconnect();
  });
};
