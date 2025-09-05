// Импорты не нужны - dataSource передается извне

export default {
  name: 'Создание таблиц для модуля capital (capital_projects и capital_contributors)',
  validUntil: new Date('2025-12-31'), // Действует до конца года

  async up({ dataSource }: { dataSource: any }): Promise<boolean> {
    console.log('Выполнение миграции: Создание таблиц для модуля capital');

    try {
      console.log('Используем существующее подключение к PostgreSQL');

      // Создание таблицы capital_projects
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "capital_projects" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "blockchain_id" varchar NULL,
          "block_num" int NULL,
          "present" boolean NOT NULL DEFAULT true,
          "coopname" varchar(12) NOT NULL,
          "project_hash" varchar(64) NOT NULL,
          "parent_hash" varchar(64) NULL,
          "blockchain_status" varchar(20) NOT NULL,
          "is_opened" boolean NOT NULL DEFAULT false,
          "is_planed" boolean NOT NULL DEFAULT false,
          "can_convert_to_project" boolean NOT NULL DEFAULT false,
          "master" varchar(12) NOT NULL,
          "title" varchar NOT NULL,
          "description" text NOT NULL,
          "meta" text NULL,
          "counts" json NOT NULL,
          "plan" json NOT NULL,
          "fact" json NOT NULL,
          "crps" json NOT NULL,
          "voting" json NOT NULL,
          "membership" json NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "status" varchar NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
          CONSTRAINT "PK_capital_projects" PRIMARY KEY ("id")
        )
      `);

      // Создание индексов для capital_projects
      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "idx_capital_projects_blockchain_id" ON "capital_projects" ("blockchain_id");
        CREATE INDEX IF NOT EXISTS "idx_capital_projects_hash" ON "capital_projects" ("project_hash");
        CREATE INDEX IF NOT EXISTS "idx_capital_projects_coopname" ON "capital_projects" ("coopname");
        CREATE INDEX IF NOT EXISTS "idx_capital_projects_status" ON "capital_projects" ("status");
        CREATE INDEX IF NOT EXISTS "idx_capital_projects_master" ON "capital_projects" ("master");
      `);

      console.log('Таблица capital_projects создана успешно');

      // Создание таблицы capital_contributors
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "capital_contributors" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "blockchain_id" varchar NULL,
          "block_num" int NULL,
          "present" boolean NOT NULL DEFAULT true,
          "coopname" varchar(12) NOT NULL,
          "username" varchar(12) NOT NULL,
          "contributor_hash" varchar(64) NOT NULL,
          "blockchain_status" varchar(20) NOT NULL,
          "memo" text NULL,
          "is_external_contract" boolean NOT NULL DEFAULT false,
          "contract" json NULL,
          "appendixes" json NULL,
          "rate_per_hour" varchar(50) NULL,
          "debt_amount" varchar(50) NULL,
          "capital_available" varchar(50) NULL,
          "reward_per_share_last" varchar(50) NULL,
          "contributed_as_investor" varchar(50) NULL,
          "contributed_as_creator" varchar(50) NULL,
          "contributed_as_author" varchar(50) NULL,
          "contributed_as_coordinator" varchar(50) NULL,
          "contributed_as_contributor" varchar(50) NULL,
          "contributed_as_propertor" varchar(50) NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "status" varchar NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REMOVED')),
          CONSTRAINT "PK_capital_contributors" PRIMARY KEY ("id")
        )
      `);

      // Создание индексов для capital_contributors
      await dataSource.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "idx_capital_contributors_blockchain_id" ON "capital_contributors" ("blockchain_id");
        CREATE INDEX IF NOT EXISTS "idx_capital_contributors_hash" ON "capital_contributors" ("contributor_hash");
        CREATE INDEX IF NOT EXISTS "idx_capital_contributors_coopname" ON "capital_contributors" ("coopname");
        CREATE INDEX IF NOT EXISTS "idx_capital_contributors_username" ON "capital_contributors" ("username");
        CREATE INDEX IF NOT EXISTS "idx_capital_contributors_status" ON "capital_contributors" ("status");
      `);

      console.log('Таблица capital_contributors создана успешно');

      console.log('Миграция завершена: Таблицы capital созданы успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при выполнении миграции capital:', error);
      return false;
    }
  },

  async down({ dataSource }: { dataSource: any }): Promise<boolean> {
    console.log('Откат миграции: Удаление таблиц capital');

    try {
      console.log('Используем существующее подключение к PostgreSQL для отката');

      // Удаляем таблицы capital с указанием схемы
      await dataSource.query(`DROP TABLE IF EXISTS public.capital_contributors CASCADE`);
      await dataSource.query(`DROP TABLE IF EXISTS public.capital_projects CASCADE`);

      console.log('Таблицы capital удалены успешно');

      console.log('Откат миграции завершен: Таблицы capital удалены успешно');
      return true;
    } catch (error) {
      console.error('Ошибка при откате миграции capital:', error);
      return false;
    }
  },
};
