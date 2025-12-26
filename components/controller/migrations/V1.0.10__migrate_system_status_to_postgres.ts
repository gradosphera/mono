import mongoose from 'mongoose';

export default {
  name: 'Миграция статуса системы из MongoDB в PostgreSQL',
  validUntil: new Date(), // Текущая дата, миграция больше не будет применяться
  async up({ dataSource, logger }: { dataSource: any; logger: any }): Promise<boolean> {
    try {
      logger.info('Начинаем миграцию статуса системы из MongoDB в PostgreSQL...');

      // Создание таблицы system_status, если она не существует
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "system_status" (
          "coopname" character varying(12) NOT NULL,
          "status" character varying(20) NOT NULL DEFAULT 'install',
          "install_code" character varying(255),
          "install_code_expires_at" TIMESTAMP,
          "init_by_server" boolean NOT NULL DEFAULT false,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_system_status" PRIMARY KEY ("coopname")
        );
      `);

      // Создание индексов для оптимизации запросов
      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_system_status_install_code" ON "system_status" ("install_code");
      `);

      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_system_status_install_code_expires_at" ON "system_status" ("install_code_expires_at");
      `);

      logger.info('Структура таблицы system_status создана.');

      // Проверяем, есть ли уже данные в PostgreSQL
      const existingCount = await dataSource.query(`
        SELECT COUNT(*) as count FROM "system_status";
      `);

      if (parseInt(existingCount[0].count) > 0) {
        logger.info(`Таблица system_status уже содержит ${existingCount[0].count} записей. Пропускаем миграцию данных.`);
        return true;
      }

      // Получаем данные из MongoDB
      logger.info('Получаем статус системы из MongoDB...');

      // MongoDB уже подключена мигратором, используем существующее подключение
      if (!mongoose.connection.readyState) {
        throw new Error('MongoDB connection is not established');
      }

      const monoCollection = mongoose.connection.collection('monos');

      // Получаем все записи статуса системы из MongoDB
      const mongoRecords = await monoCollection.find({}).toArray();
      logger.info(`Найдено ${mongoRecords.length} записей статуса системы в MongoDB.`);

      if (mongoRecords.length === 0) {
        logger.info('Записи статуса системы в MongoDB не найдены. Миграция завершена.');
        return true;
      }

      // Подготавливаем данные для вставки в PostgreSQL
      const recordsToInsert = mongoRecords.map((mongoRecord: any) => ({
        coopname: mongoRecord.coopname,
        status: mongoRecord.status || 'install',
        install_code: mongoRecord.install_code || null,
        install_code_expires_at: mongoRecord.install_code_expires_at ? new Date(mongoRecord.install_code_expires_at) : null,
        init_by_server: mongoRecord.init_by_server || false,
        created_at: mongoRecord.createdAt || mongoRecord.created_at || new Date(),
        updated_at: mongoRecord.updatedAt || mongoRecord.updated_at || new Date(),
      }));

      // Вставляем данные в PostgreSQL
      let insertedCount = 0;

      for (const record of recordsToInsert) {
        await dataSource.query(
          `
          INSERT INTO "system_status" ("coopname", "status", "install_code", "install_code_expires_at", "init_by_server", "created_at", "updated_at")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT ("coopname") DO UPDATE SET
            "status" = EXCLUDED."status",
            "install_code" = EXCLUDED."install_code",
            "install_code_expires_at" = EXCLUDED."install_code_expires_at",
            "init_by_server" = EXCLUDED."init_by_server",
            "updated_at" = EXCLUDED."updated_at";
        `,
          [
            record.coopname,
            record.status,
            record.install_code,
            record.install_code_expires_at,
            record.init_by_server,
            record.created_at,
            record.updated_at,
          ]
        );

        insertedCount++;
        logger.info(`Перенесено ${insertedCount}/${recordsToInsert.length} записей статуса системы...`);
      }

      logger.info(`Миграция завершена. Перенесено ${insertedCount} записей статуса системы.`);

      return true;
    } catch (error) {
      logger.error('Ошибка при выполнении миграции статуса системы:', error);
      return false;
    }
  },

  async down({ dataSource, logger }: { dataSource: any; logger: any }): Promise<boolean> {
    try {
      logger.info('Откат миграции статуса системы...');

      // Удаляем таблицу system_status
      await dataSource.query(`DROP TABLE IF EXISTS "system_status";`);

      logger.info('Таблица system_status и связанные индексы удалены.');
      return true;
    } catch (error) {
      logger.error('Ошибка при откате миграции статуса системы:', error);
      return false;
    }
  },
};
