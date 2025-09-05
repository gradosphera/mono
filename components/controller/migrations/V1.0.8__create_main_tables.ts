// Импорты не нужны - dataSource передается извне

export default {
  name: 'Создание основных таблиц базы данных',
  validUntil: new Date('2025-12-31'), // Действует до конца года

  async up({ dataSource }: { dataSource: any }): Promise<boolean> {
    console.log('Выполнение миграции: Создание основных таблиц базы данных');

    try {
      console.log('Используем существующее подключение к PostgreSQL');

      // Создание enum типов для платежей
      await dataSource.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
            CREATE TYPE "payment_status_enum" AS ENUM(
              'pending',
              'processing',
              'paid',
              'completed',
              'failed',
              'expired',
              'cancelled',
              'refunded'
            );
          END IF;
        END
        $$;
      `);

      await dataSource.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type_enum') THEN
            CREATE TYPE "payment_type_enum" AS ENUM(
              'registration',
              'deposit',
              'withdrawal'
            );
          END IF;
        END
        $$;
      `);

      await dataSource.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_direction_enum') THEN
            CREATE TYPE "payment_direction_enum" AS ENUM(
              'incoming',
              'outgoing'
            );
          END IF;
        END
        $$;
      `);

      // Создание таблицы extensions
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "extensions" (
          "name" varchar(12) NOT NULL,
          "enabled" boolean NOT NULL DEFAULT true,
          "config" jsonb NOT NULL DEFAULT '{}',
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_extensions" PRIMARY KEY ("name")
        )
      `);

      // Создание таблицы log_extensions
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "log_extensions" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "extension_name" varchar(12) NOT NULL,
          "level" varchar(20) NOT NULL,
          "message" text NOT NULL,
          "meta" jsonb NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_log_extensions" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы meet_pre
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "meet_pre" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "coopname" varchar(12) NOT NULL,
          "username" varchar(12) NOT NULL,
          "hash" varchar(64) NOT NULL,
          "blockchain_id" bigint NULL,
          "block_num" int NULL,
          "present" boolean NOT NULL DEFAULT true,
          "status" varchar(20) NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_meet_pre" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы meet_processed
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "meet_processed" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "coopname" varchar(12) NOT NULL,
          "username" varchar(12) NOT NULL,
          "hash" varchar(64) NOT NULL,
          "blockchain_id" bigint NULL,
          "block_num" int NULL,
          "present" boolean NOT NULL DEFAULT true,
          "status" varchar(20) NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_meet_processed" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы migrations
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "migrations" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" varchar NOT NULL,
          "executed_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_migrations" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы candidates
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "candidates" (
          "username" varchar NOT NULL,
          "coopname" varchar NOT NULL,
          "braname" varchar NULL,
          "status" varchar NOT NULL,
          "type" varchar NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "statement" json NULL,
          "wallet_agreement" json NULL,
          "signature_agreement" json NULL,
          "privacy_agreement" json NULL,
          "user_agreement" json NULL,
          "registration_hash" varchar NOT NULL,
          "referer" varchar NULL,
          "public_key" varchar NOT NULL,
          "meta" varchar NULL,
          CONSTRAINT "PK_candidates" PRIMARY KEY ("username")
        )
      `);

      // Создание таблицы payments
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "payments" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "hash" varchar NOT NULL,
          "coopname" varchar NOT NULL,
          "username" varchar NOT NULL,
          "quantity" numeric NOT NULL,
          "symbol" varchar NOT NULL,
          "type" payment_type_enum NOT NULL,
          "direction" payment_direction_enum NOT NULL,
          "status" payment_status_enum NOT NULL DEFAULT 'pending',
          "provider" varchar NULL,
          "payment_method_id" varchar NULL,
          "secret" varchar NULL,
          "message" text NULL,
          "memo" text NULL,
          "expired_at" TIMESTAMP NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NULL,
          "payment_details" json NULL,
          "blockchain_data" json NULL,
          "statement" json NULL,
          CONSTRAINT "PK_payments" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы web_push_subscriptions
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "web_push_subscriptions" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "endpoint" varchar NOT NULL,
          "expiration_time" bigint NULL,
          "p256dh" varchar NOT NULL,
          "auth" varchar NOT NULL,
          "user_id" varchar NULL,
          "username" varchar NULL,
          "coopname" varchar NULL,
          "device_info" json NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_web_push_subscriptions" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы ledger_operations
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "ledger_operations" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "blockchain_id" bigint NULL,
          "block_num" int NULL,
          "present" boolean NOT NULL DEFAULT true,
          "coopname" varchar(12) NOT NULL,
          "username" varchar(12) NOT NULL,
          "type" varchar(50) NOT NULL,
          "quantity" varchar(50) NOT NULL,
          "symbol" varchar(10) NOT NULL,
          "memo" text NULL,
          "meta" json NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_ledger_operations" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы blockchain_actions
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "blockchain_actions" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "transaction_id" varchar(64) NOT NULL,
          "account" varchar(16) NOT NULL,
          "block_num" bigint NOT NULL,
          "block_id" varchar(64) NOT NULL,
          "chain_id" varchar(64) NOT NULL,
          "name" varchar(16) NOT NULL,
          "receiver" varchar(16) NOT NULL,
          "authorization" jsonb NOT NULL,
          "data" jsonb NOT NULL,
          "action_ordinal" int NOT NULL,
          "global_sequence" varchar(32) NOT NULL,
          "account_ram_deltas" jsonb NOT NULL,
          "console" text NULL,
          "receipt" jsonb NOT NULL,
          "creator_action_ordinal" int NOT NULL,
          "context_free" boolean NOT NULL,
          "elapsed" int NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_blockchain_actions" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_blockchain_actions_global_sequence" UNIQUE ("global_sequence")
        )
      `);

      // Создание индексов для blockchain_actions
      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "idx_blockchain_actions_account_name" ON "blockchain_actions" ("account", "name");
        CREATE INDEX IF NOT EXISTS "idx_blockchain_actions_block_num" ON "blockchain_actions" ("block_num");
      `);

      // Создание таблицы blockchain_deltas
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "blockchain_deltas" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "block_num" bigint NOT NULL,
          "block_id" varchar(64) NOT NULL,
          "chain_id" varchar(64) NOT NULL,
          "name" varchar(64) NOT NULL,
          "code" varchar(64) NOT NULL,
          "scope" varchar(64) NOT NULL,
          "table" varchar(64) NOT NULL,
          "primary_key" varchar(64) NOT NULL,
          "payer" varchar(64) NOT NULL,
          "data" jsonb NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_blockchain_deltas" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы blockchain_forks
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "blockchain_forks" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "block_num" bigint NOT NULL,
          "block_id" varchar(64) NOT NULL,
          "previous_block_id" varchar(64) NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_blockchain_forks" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы sync_states
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "sync_states" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" varchar(100) NOT NULL,
          "block_num" bigint NOT NULL DEFAULT 0,
          "block_id" varchar(64) NULL,
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_sync_states" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_sync_states_name" UNIQUE ("name")
        )
      `);

      console.log('Основные таблицы базы данных созданы успешно');

      console.log('Миграция завершена: Основные таблицы базы данных созданы успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при выполнении миграции основных таблиц:', error);
      return false;
    }
  },

  async down({ dataSource }: { dataSource: any }): Promise<boolean> {
    console.log('Откат миграции: Удаление основных таблиц базы данных');

    try {
      console.log('Используем существующее подключение к PostgreSQL для отката');

      // Удаляем таблицы в обратном порядке создания
      await dataSource.query(`DROP TABLE IF EXISTS "sync_states"`);
      await dataSource.query(`DROP TABLE IF EXISTS "blockchain_forks"`);
      await dataSource.query(`DROP TABLE IF EXISTS "blockchain_deltas"`);
      await dataSource.query(`DROP TABLE IF EXISTS "blockchain_actions"`);
      await dataSource.query(`DROP TABLE IF EXISTS "ledger_operations"`);
      await dataSource.query(`DROP TABLE IF EXISTS "web_push_subscriptions"`);
      await dataSource.query(`DROP TABLE IF EXISTS "payments"`);
      await dataSource.query(`DROP TABLE IF EXISTS "candidates"`);
      await dataSource.query(`DROP TABLE IF EXISTS "migrations"`);
      await dataSource.query(`DROP TABLE IF EXISTS "meet_processed"`);
      await dataSource.query(`DROP TABLE IF EXISTS "meet_pre"`);
      await dataSource.query(`DROP TABLE IF EXISTS "log_extensions"`);
      await dataSource.query(`DROP TABLE IF EXISTS "extensions"`);

      // Удаляем enum типы
      await dataSource.query(`DROP TYPE IF EXISTS "payment_direction_enum"`);
      await dataSource.query(`DROP TYPE IF EXISTS "payment_type_enum"`);
      await dataSource.query(`DROP TYPE IF EXISTS "payment_status_enum"`);

      console.log('Основные таблицы базы данных удалены успешно');

      console.log('Откат миграции завершен: Основные таблицы базы данных удалены успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при откате миграции основных таблиц:', error);
      return false;
    }
  },
};
