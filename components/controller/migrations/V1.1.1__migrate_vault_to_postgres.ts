import mongoose from 'mongoose';

export default {
  name: 'Миграция Vault из MongoDB в PostgreSQL',
  validUntil: new Date(), // Текущая дата, миграция больше не будет применяться
  async up({ dataSource, logger }: { dataSource: any; logger: any }): Promise<boolean> {
    try {
      logger.info('Начинаем миграцию Vault из MongoDB в PostgreSQL...');

      // Создание таблицы vaults, если она не существует
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "vaults" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "username" character varying(50) NOT NULL,
          "permission" character varying(20) NOT NULL DEFAULT 'active',
          "wif" text NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_vaults" PRIMARY KEY ("id")
        );
      `);

      // Создание индексов для оптимизации запросов
      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vaults_username_permission" ON "vaults" ("username", "permission");
      `);

      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_vaults_username" ON "vaults" ("username");
      `);

      logger.info('Структура таблицы vaults создана.');

      // Проверяем, есть ли уже данные в PostgreSQL
      const existingCount = await dataSource.query(`
        SELECT COUNT(*) as count FROM "vaults";
      `);

      if (parseInt(existingCount[0].count) > 0) {
        logger.info(`Таблица vaults уже содержит ${existingCount[0].count} записей. Пропускаем миграцию данных.`);
        return true;
      }

      // Получаем данные из MongoDB
      logger.info('Получаем данные Vault из MongoDB...');

      // MongoDB уже подключена мигратором, используем существующее подключение
      if (!mongoose.connection.readyState) {
        throw new Error('MongoDB connection is not established');
      }

      const vaultCollection = mongoose.connection.collection('vaults');

      // Получаем все записи vault из MongoDB
      const mongoVaults = await vaultCollection.find({}).toArray();
      logger.info(`Найдено ${mongoVaults.length} записей Vault в MongoDB.`);

      if (mongoVaults.length === 0) {
        logger.info('Записи Vault в MongoDB не найдены. Миграция завершена.');
        return true;
      }

      // Подготавливаем данные для вставки в PostgreSQL
      const vaultsToInsert = mongoVaults.map((mongoVault: any) => ({
        username: mongoVault.username,
        permission: mongoVault.permission || 'active',
        wif: mongoVault.wif, // Уже зашифрованный
        created_at: mongoVault.createdAt || mongoVault.created_at || new Date(),
        updated_at: mongoVault.updatedAt || mongoVault.updated_at || new Date(),
      }));

      // Вставляем данные в PostgreSQL пакетами по 1000 записей
      const batchSize = 1000;
      let insertedCount = 0;

      for (let i = 0; i < vaultsToInsert.length; i += batchSize) {
        const batch = vaultsToInsert.slice(i, i + batchSize);

        const values = batch
          .map(
            (vault: any) =>
              `('${vault.username.replace(/'/g, "''")}', '${vault.permission}', '${vault.wif.replace(
                /'/g,
                "''"
              )}', '${vault.created_at.toISOString()}', '${vault.updated_at.toISOString()}')`
          )
          .join(', ');

        await dataSource.query(`
          INSERT INTO "vaults" ("username", "permission", "wif", "created_at", "updated_at")
          VALUES ${values}
          ON CONFLICT ("username", "permission") DO NOTHING;
        `);

        insertedCount += batch.length;
        logger.info(`Вставлено ${insertedCount}/${vaultsToInsert.length} записей Vault...`);
      }

      logger.info(`Миграция Vault завершена. Перенесено ${insertedCount} записей Vault.`);

      return true;
    } catch (error) {
      logger.error('Ошибка при выполнении миграции Vault:', error);
      return false;
    }
  },

  async down({ dataSource, logger }: { dataSource: any; logger: any }): Promise<boolean> {
    try {
      logger.info('Откат миграции Vault...');

      // Удаляем таблицу vaults
      await dataSource.query(`DROP TABLE IF EXISTS "vaults";`);

      logger.info('Таблица vaults и связанные индексы удалены.');
      return true;
    } catch (error) {
      logger.error('Ошибка при откате миграции Vault:', error);
      return false;
    }
  },
};
