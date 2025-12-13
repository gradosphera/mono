// Импорты не нужны - dataSource передается извне

export default {
  name: 'Создание основных таблиц базы данных',
  validUntil: new Date(), // Текущая дата, миграция больше не будет применяться
  async up({ dataSource }: { dataSource: any }): Promise<boolean> {
    try {

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

      // Создание таблицы extensions_logs
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "extensions_logs" (
          "id" SERIAL NOT NULL,
          "name" varchar(12) NOT NULL,
          "data" jsonb NOT NULL DEFAULT '{}',
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_extensions_logs" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы meet_pre
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "meet_pre" (
          "hash" varchar(64) NOT NULL,
          "coopname" varchar(12) NOT NULL,
          "initiator" varchar(12) NOT NULL,
          "presider" varchar(12) NOT NULL,
          "secretary" varchar(12) NOT NULL,
          "agenda" jsonb NOT NULL,
          "open_at" TIMESTAMP NOT NULL,
          "close_at" TIMESTAMP NOT NULL,
          "proposal" jsonb NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_meet_pre" PRIMARY KEY ("hash")
        )
      `);

      // Создание таблицы meet_processed
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "meet_processed" (
          "hash" varchar(64) NOT NULL,
          "coopname" varchar(12) NOT NULL,
          "presider" varchar(12) NOT NULL,
          "secretary" varchar(12) NOT NULL,
          "results" jsonb NOT NULL,
          "signed_ballots" integer NOT NULL,
          "quorum_percent" numeric NOT NULL,
          "quorum_passed" boolean NOT NULL,
          "decision" jsonb NOT NULL,
          CONSTRAINT "PK_meet_processed" PRIMARY KEY ("hash")
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
          "username" varchar(255) NOT NULL,
          "endpoint" text NOT NULL,
          "p256dhKey" varchar(255) NOT NULL,
          "authKey" varchar(255) NOT NULL,
          "userAgent" text NULL,
          "isActive" boolean NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_web_push_subscriptions" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_web_push_subscriptions_endpoint" UNIQUE ("endpoint")
        )
      `);

      // Создание таблицы ledger_operations
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "ledger_operations" (
          "global_sequence" bigint NOT NULL,
          "coopname" varchar(12) NOT NULL,
          "action" varchar(20) NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "account_id" bigint NULL,
          "quantity" varchar(100) NULL,
          "comment" text NULL,
          CONSTRAINT "PK_ledger_operations" PRIMARY KEY ("global_sequence")
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

      // Создание индексов для ledger_operations
      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "idx_ledger_operations_coopname_created_at" ON "ledger_operations" ("coopname", "created_at");
        CREATE INDEX IF NOT EXISTS "idx_ledger_operations_coopname_account_id_created_at" ON "ledger_operations" ("coopname", "account_id", "created_at");
      `);

      // Создание индексов для blockchain_deltas
      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "idx_blockchain_deltas_code_table" ON "blockchain_deltas" ("code", "table");
        CREATE INDEX IF NOT EXISTS "idx_blockchain_deltas_block_num" ON "blockchain_deltas" ("block_num");
        CREATE INDEX IF NOT EXISTS "idx_blockchain_deltas_primary_key" ON "blockchain_deltas" ("primary_key");
        CREATE INDEX IF NOT EXISTS "idx_blockchain_deltas_code_scope_table_primary_key" ON "blockchain_deltas" ("code", "scope", "table", "primary_key");
      `);

      // Создание индексов для blockchain_forks
      await dataSource.query(`
        CREATE INDEX IF NOT EXISTS "idx_blockchain_forks_block_num" ON "blockchain_forks" ("block_num");
      `);

      // Создание таблицы blockchain_deltas
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "blockchain_deltas" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "chain_id" varchar NOT NULL,
          "block_num" bigint NOT NULL,
          "block_id" varchar NOT NULL,
          "present" boolean NOT NULL,
          "code" varchar NOT NULL,
          "scope" varchar NOT NULL,
          "table" varchar NOT NULL,
          "primary_key" varchar NOT NULL,
          "value" jsonb NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_blockchain_deltas" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы blockchain_forks
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "blockchain_forks" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "chain_id" varchar NOT NULL,
          "block_num" bigint NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_blockchain_forks" PRIMARY KEY ("id")
        )
      `);

      // Создание таблицы blockchain_sync_state
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "blockchain_sync_state" (
          "key" varchar(50) NOT NULL,
          "block_num" bigint NOT NULL,
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_blockchain_sync_state" PRIMARY KEY ("key")
        )
      `);

      return true;
    } catch (error) {
      console.error('Ошибка при выполнении миграции основных таблиц:', error);
      return false;
    }
  },

  async down({ dataSource }: { dataSource: any }): Promise<boolean> {
    try {

      // Удаляем таблицы в обратном порядке создания
      await dataSource.query(`DROP TABLE IF EXISTS "blockchain_sync_state"`);
      await dataSource.query(`DROP TABLE IF EXISTS "blockchain_forks"`);
      await dataSource.query(`DROP TABLE IF EXISTS "blockchain_deltas"`);
      await dataSource.query(`DROP TABLE IF EXISTS "blockchain_actions"`);
      await dataSource.query(`DROP TABLE IF EXISTS "ledger_operations"`);
      await dataSource.query(`DROP TABLE IF EXISTS "web_push_subscriptions"`);
      await dataSource.query(`DROP TABLE IF EXISTS "payments"`);
      await dataSource.query(`DROP TABLE IF EXISTS "candidates"`);
      await dataSource.query(`DROP TABLE IF EXISTS "meet_processed"`);
      await dataSource.query(`DROP TABLE IF EXISTS "meet_pre"`);
      await dataSource.query(`DROP TABLE IF EXISTS "extensions_logs"`);
      await dataSource.query(`DROP TABLE IF EXISTS "extensions"`);

      // Удаляем enum типы
      await dataSource.query(`DROP TYPE IF EXISTS "payment_direction_enum"`);
      await dataSource.query(`DROP TYPE IF EXISTS "payment_type_enum"`);
      await dataSource.query(`DROP TYPE IF EXISTS "payment_status_enum"`);

      return true;
    } catch (error) {
      console.error('Ошибка при откате миграции основных таблиц:', error);
      return false;
    }
  },
};
