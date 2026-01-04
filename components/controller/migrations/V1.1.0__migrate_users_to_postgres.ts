import mongoose from 'mongoose';

export default {
  name: 'Миграция пользователей из MongoDB в PostgreSQL',
  validUntil: new Date(), // Текущая дата, миграция больше не будет применяться
  async up({ dataSource, logger }: { dataSource: any; logger: any }): Promise<boolean> {
    try {
      logger.info('Начинаем миграцию пользователей из MongoDB в PostgreSQL...');

      // Создание таблицы users, если она не существует
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "username" character varying(50) NOT NULL,
          "status" character varying(20) NOT NULL,
          "message" text NOT NULL DEFAULT '',
          "is_registered" boolean NOT NULL DEFAULT false,
          "has_account" boolean NOT NULL DEFAULT false,
          "type" character varying(20) NOT NULL,
          "public_key" text NOT NULL DEFAULT '',
          "referer" character varying(100) NOT NULL DEFAULT '',
          "email" character varying(255),
          "role" character varying(20) NOT NULL DEFAULT 'user',
          "is_email_verified" boolean NOT NULL DEFAULT false,
          "subscriber_id" character varying(100) NOT NULL DEFAULT '',
          "subscriber_hash" character varying(255) NOT NULL DEFAULT '',
          "legacy_mongo_id" character varying(50),
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_users" PRIMARY KEY ("id")
        );
      `);

      // Создание индексов для оптимизации запросов
      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_username" ON "users" ("username");
      `);

      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email") WHERE "email" IS NOT NULL;
      `);

      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_subscriber_id" ON "users" ("subscriber_id") WHERE "subscriber_id" IS NOT NULL AND "subscriber_id" != '';
      `);

      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_users_status" ON "users" ("status");
      `);

      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_users_type" ON "users" ("type");
      `);

      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_users_role" ON "users" ("role");
      `);

      logger.info('Структура таблицы users создана.');

      // Проверяем, есть ли уже данные в PostgreSQL
      const existingCount = await dataSource.query(`
        SELECT COUNT(*) as count FROM "users";
      `);

      if (parseInt(existingCount[0].count) > 0) {
        logger.info(`Таблица users уже содержит ${existingCount[0].count} записей. Пропускаем миграцию данных.`);
        return true;
      }

      // Получаем данные из MongoDB
      logger.info('Получаем пользователей из MongoDB...');

      // MongoDB уже подключена мигратором, используем существующее подключение
      if (!mongoose.connection.readyState) {
        throw new Error('MongoDB connection is not established');
      }

      const usersCollection = mongoose.connection.collection('users');

      // Получаем все пользователи из MongoDB
      const mongoUsers = await usersCollection.find({}).toArray();
      logger.info(`Найдено ${mongoUsers.length} пользователей в MongoDB.`);

      if (mongoUsers.length === 0) {
        logger.info('Пользователи в MongoDB не найдены. Миграция завершена.');
        return true;
      }

      // Подготавливаем данные для вставки в PostgreSQL
      // Фильтруем пользователей без username
      const usersToInsert = mongoUsers
        .filter((mongoUser: any) => mongoUser.username && mongoUser.username.trim() !== '')
        .map((mongoUser: any) => ({
          username: mongoUser.username,
          status: mongoUser.status || 'created',
          message: mongoUser.message || '',
          is_registered: mongoUser.is_registered || false,
          has_account: mongoUser.has_account || false,
          type: mongoUser.type,
          public_key: mongoUser.public_key || '',
          referer: mongoUser.referer || '',
          email: mongoUser.email || null,
          role: mongoUser.role || 'user',
          is_email_verified: mongoUser.is_email_verified || false,
          subscriber_id: mongoUser.subscriber_id || '',
          subscriber_hash: mongoUser.subscriber_hash || '',
          legacy_mongo_id: mongoUser._id?.toString() || null,
          created_at: mongoUser.createdAt || mongoUser.created_at || new Date(),
          updated_at: mongoUser.updatedAt || mongoUser.updated_at || new Date(),
        }));

      // Вставляем данные в PostgreSQL пакетами по 1000 записей
      const batchSize = 1000;
      let insertedCount = 0;

      for (let i = 0; i < usersToInsert.length; i += batchSize) {
        const batch = usersToInsert.slice(i, i + batchSize);

        const values = batch
          .map(
            (user: any) =>
              `('${user.username.replace(/'/g, "''")}', '${user.status}', '${user.message.replace(/'/g, "''")}', ${
                user.is_registered
              }, ${user.has_account}, '${user.type}', '${user.public_key.replace(/'/g, "''")}', '${user.referer.replace(
                /'/g,
                "''"
              )}', ${user.email ? `'${user.email.replace(/'/g, "''")}'` : 'NULL'}, '${user.role}', ${
                user.is_email_verified
              }, '${user.subscriber_id.replace(/'/g, "''")}', '${user.subscriber_hash.replace(/'/g, "''")}', ${
                user.legacy_mongo_id ? `'${user.legacy_mongo_id.replace(/'/g, "''")}'` : 'NULL'
              }, '${user.created_at.toISOString()}', '${user.updated_at.toISOString()}')`
          )
          .join(', ');

        await dataSource.query(`
          INSERT INTO "users" ("username", "status", "message", "is_registered", "has_account", "type", "public_key", "referer", "email", "role", "is_email_verified", "subscriber_id", "subscriber_hash", "legacy_mongo_id", "created_at", "updated_at")
          VALUES ${values}
          ON CONFLICT ("username") DO NOTHING;
        `);

        insertedCount += batch.length;
        logger.info(`Вставлено ${insertedCount}/${usersToInsert.length} пользователей...`);
      }

      logger.info(`Миграция завершена. Перенесено ${insertedCount} пользователей.`);

      return true;
    } catch (error) {
      logger.error('Ошибка при выполнении миграции пользователей:', error);
      return false;
    }
  },

  async down({ dataSource, logger }: { dataSource: any; logger: any }): Promise<boolean> {
    try {
      logger.info('Откат миграции пользователей...');

      // Удаляем таблицу users
      await dataSource.query(`DROP TABLE IF EXISTS "users";`);

      logger.info('Таблица users и связанные индексы удалены.');
      return true;
    } catch (error) {
      logger.error('Ошибка при откате миграции пользователей:', error);
      return false;
    }
  },
};
