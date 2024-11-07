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
    console.log('Connected to PostgreSQL');

    // Получаем данные из MongoDB
    const mongoData = await PluginConfig.find().exec();
    const postgresRepo = AppDataSource.getRepository(ExtensionEntity);

    logger.info(`Запускаем миграцию данных mongo - postgres`);
    // Переносим данные в PostgreSQL
    for (const data of mongoData) {
      const app = data.toObject();

      // Проверяем, существует ли запись с таким же значением name
      const existingApp = await postgresRepo.findOne({ where: { name: app.name } });

      if (!existingApp) {
        // Если записи нет, вставляем новую
        await postgresRepo.insert(app);
        logger.info(`Запись с именем ${app.name} добавлена.`);
      } else {
        logger.info(`Запись с именем ${app.name} уже существует, пропуск...`);
      }
    }

    logger.info('Data migration completed successfully');
  } catch (error) {
    logger.error('Error during data migration:', error);
  } finally {
    await mongoose.disconnect();
    await AppDataSource.destroy();
  }
};
