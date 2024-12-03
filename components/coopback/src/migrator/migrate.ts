import 'reflect-metadata';
import mongoose from 'mongoose';
import { DataSource } from 'typeorm';
// Импорт моделей или схем для MongoDB и PostgreSQL
import { PluginConfig } from '~/models/pluginConfig.model';
import { ExtensionEntity } from '~/infrastructure/database/typeorm/entities/extension.entity';
import config from '~/config/config';
import logger from '~/config/logger';

// Настройка подключения к MongoDB
const mongoConnect = async () => {
  await mongoose.connect(config.mongoose.url);
  console.log('Connected to MongoDB for migration');
};

// Настройка подключения к PostgreSQL
const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.postgres.host,
  port: Number(config.postgres.port),
  username: config.postgres.username,
  password: config.postgres.password,
  database: config.postgres.database,
  entities: [ExtensionEntity],
  synchronize: true, // Рекомендуется отключить в продакшене
});

export const migrateData = async () => {
  try {
    await mongoConnect();
    await AppDataSource.initialize();

    console.log('Получение записей...');
    // Обращаемся напрямую к коллекции
    const organizationsCollection = mongoose.connection.collection('organizations');
    console.log('Обновление организаций...');

    // Находим все записи, где поле fact_address отсутствует
    const organizations = await organizationsCollection.find({ fact_address: { $exists: false } }).toArray();

    for (const organization of organizations) {
      await organizationsCollection.updateOne(
        { _id: organization._id }, // Условие для обновления
        { $set: { fact_address: organization.full_address } } // Копируем значение full_address в fact_address
      );
    }

    console.log(`Обновлено организаций: ${organizations.length}`);

    console.log('Получение записей...');

    const paymentMethodsCollection = mongoose.connection.collection('paymentMethods');
    console.log('Обновление платежных методов...');

    // Находим все записи с числовым method_id
    const paymentMethods = await paymentMethodsCollection.find({ method_id: { $type: 'int' } }).toArray();

    for (const paymentMethod of paymentMethods) {
      await paymentMethodsCollection.updateOne(
        { _id: paymentMethod._id }, // Условие для обновления
        { $set: { method_id: String(paymentMethod.method_id) } } // Преобразование method_id в строку
      );
    }

    console.log(`Обновлено платежных методов: ${paymentMethods.length}`);

    // console.log('Connected to PostgreSQL');

    // // Получаем данные из MongoDB
    // const mongoData = await PluginConfig.find().exec();
    // const postgresRepo = AppDataSource.getRepository(ExtensionEntity);

    // logger.info(`Запускаем миграцию данных mongo - postgres`);
    // // Переносим данные в PostgreSQL
    // for (const data of mongoData) {
    //   const app = data.toObject();

    //   // Проверяем, существует ли запись с таким же значением name
    //   const existingApp = await postgresRepo.findOne({ where: { name: app.name } });

    //   if (!existingApp) {
    //     // Если записи нет, вставляем новую
    //     await postgresRepo.insert(app);
    //     logger.info(`Запись с именем ${app.name} добавлена.`);
    //   } else {
    //     logger.info(`Запись с именем ${app.name} уже существует, пропуск...`);
    //   }
    // }

    logger.info('Data migration completed successfully');
  } catch (error) {
    logger.error('Error during data migration:', error);
  } finally {
    await mongoose.disconnect();
    await AppDataSource.destroy();
  }
};
