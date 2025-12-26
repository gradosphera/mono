import mongoose from 'mongoose';

export default {
  name: 'Миграция токенов из MongoDB в PostgreSQL',
  validUntil: new Date(), // Текущая дата, миграция больше не будет применяться
  async up({ dataSource, logger }: { dataSource: any; logger: any }): Promise<boolean> {
    try {
      logger.info('Начинаем миграцию токенов из MongoDB в PostgreSQL...');

      // Создание таблицы tokens, если она не существует
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "tokens" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "token" character varying(1024) NOT NULL,
          "user_id" character varying(50) NOT NULL,
          "type" character varying(20) NOT NULL,
          "expires" TIMESTAMP NOT NULL,
          "blacklisted" boolean NOT NULL DEFAULT false,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_tokens" PRIMARY KEY ("id")
        );
      `);

      // Создание индексов для оптимизации запросов
      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_tokens_token_type" ON "tokens" ("token", "type");
      `);

      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_tokens_user_id_type" ON "tokens" ("user_id", "type");
      `);

      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "IDX_tokens_expires" ON "tokens" ("expires");
      `);

      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tokens_token_unique" ON "tokens" ("token");
      `);

      logger.info('Структура таблицы tokens создана.');

      // Проверяем, есть ли уже данные в PostgreSQL
      const existingCount = await dataSource.query(`
        SELECT COUNT(*) as count FROM "tokens";
      `);

      if (parseInt(existingCount[0].count) > 0) {
        logger.info(`Таблица tokens уже содержит ${existingCount[0].count} записей. Пропускаем миграцию данных.`);
        return true;
      }

      // Получаем данные из MongoDB
      logger.info('Получаем токены из MongoDB...');

      // MongoDB уже подключена мигратором, используем существующее подключение
      if (!mongoose.connection.readyState) {
        throw new Error('MongoDB connection is not established');
      }

      const tokensCollection = mongoose.connection.collection('tokens');

      // Получаем все токены из MongoDB
      const mongoTokens = await tokensCollection.find({}).toArray();
      logger.info(`Найдено ${mongoTokens.length} токенов в MongoDB.`);

      if (mongoTokens.length === 0) {
        logger.info('Токены в MongoDB не найдены. Миграция завершена.');
        return true;
      }

      // Подготавливаем данные для вставки в PostgreSQL
      const tokensToInsert = mongoTokens.map((mongoToken: any) => ({
        token: mongoToken.token,
        user_id: mongoToken.user,
        type: mongoToken.type,
        expires: mongoToken.expires,
        blacklisted: mongoToken.blacklisted || false,
        created_at: mongoToken.createdAt || mongoToken.created_at || new Date(),
        updated_at: mongoToken.updatedAt || mongoToken.updated_at || new Date(),
      }));

      // Вставляем данные в PostgreSQL пакетами по 1000 записей
      const batchSize = 1000;
      let insertedCount = 0;

      for (let i = 0; i < tokensToInsert.length; i += batchSize) {
        const batch = tokensToInsert.slice(i, i + batchSize);

        const values = batch
          .map(
            (token: any) =>
              `('${token.token.replace(/'/g, "''")}', '${token.user_id}', '${
                token.type
              }', '${token.expires.toISOString()}', ${
                token.blacklisted
              }, '${token.created_at.toISOString()}', '${token.updated_at.toISOString()}')`
          )
          .join(', ');

        await dataSource.query(`
          INSERT INTO "tokens" ("token", "user_id", "type", "expires", "blacklisted", "created_at", "updated_at")
          VALUES ${values}
          ON CONFLICT ("token") DO NOTHING;
        `);

        insertedCount += batch.length;
        logger.info(`Вставлено ${insertedCount}/${tokensToInsert.length} токенов...`);
      }

      logger.info(`Миграция завершена. Перенесено ${insertedCount} токенов.`);

      return true;
    } catch (error) {
      logger.error('Ошибка при выполнении миграции токенов:', error);
      return false;
    }
  },

  async down({ dataSource, logger }: { dataSource: any; logger: any }): Promise<boolean> {
    try {
      logger.info('Откат миграции токенов...');

      // Удаляем таблицу tokens
      await dataSource.query(`DROP TABLE IF EXISTS "tokens";`);

      logger.info('Таблица tokens и связанные индексы удалены.');
      return true;
    } catch (error) {
      logger.error('Ошибка при откате миграции токенов:', error);
      return false;
    }
  },
};
