import { DataSource } from 'typeorm';
import config from '~/config/config';

export default {
  name: 'Создание таблицы веб-пуш подписок',
  validUntil: new Date(), // Текущая дата, миграция больше не будет применяться

  async up() {
    console.log('Выполнение миграции: Создание таблицы веб-пуш подписок');

    try {
      // Создаем подключение к PostgreSQL
      const dataSource = new DataSource({
        type: 'postgres',
        host: config.postgres.host,
        port: Number(config.postgres.port),
        username: config.postgres.username,
        password: config.postgres.password,
        database: config.postgres.database,
      });

      await dataSource.initialize();

      // Создаем таблицу web_push_subscriptions
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS web_push_subscriptions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" VARCHAR(255) NOT NULL,
          endpoint TEXT NOT NULL,
          "p256dhKey" VARCHAR(255) NOT NULL,
          "authKey" VARCHAR(255) NOT NULL,
          "userAgent" VARCHAR(100),
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Создаем индексы
      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS idx_web_push_subscriptions_userid
        ON web_push_subscriptions ("userId");
      `);

      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_web_push_subscriptions_endpoint
        ON web_push_subscriptions (endpoint);
      `);

      // Создаем триггер для автоматического обновления updatedAt
      await dataSource.query(`
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."updatedAt" = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await dataSource.query(`
        DROP TRIGGER IF EXISTS update_web_push_subscriptions_updated_at
        ON web_push_subscriptions;
      `);

      await dataSource.query(`
        CREATE TRIGGER update_web_push_subscriptions_updated_at
        BEFORE UPDATE ON web_push_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
      `);

      await dataSource.destroy();

      console.log('Миграция завершена: Таблица web_push_subscriptions создана');
      return true;
    } catch (error) {
      console.error('Ошибка выполнения миграции:', error);
      return false;
    }
  },
};
