/* eslint-disable node/prefer-global/process */
import { Client } from 'pg'
import type { Cooperative } from 'cooptypes'

export async function initSystemStatus() {
  console.log('Инициализация статуса системы для coopname: voskhod')

  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  })

  try {
    await client.connect()
    console.log('Подключение к PostgreSQL установлено для initSystemStatus')

    // Создаем enum тип для статуса системы
    try {
      await client.query(`
        CREATE TYPE public.system_status_status_enum AS ENUM ('install', 'initialized', 'active', 'maintenance')
      `)
    }
    catch (error) {
      // Тип уже существует, продолжаем
      console.log('Enum тип system_status_status_enum уже существует, пропускаем создание')
    }

    // Создаем таблицу system_status правильно, как в TypeORM entity
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.system_status (
        coopname varchar(12) NOT NULL,
        install_code varchar(255) NULL,
        install_code_expires_at timestamp NULL,
        init_by_server bool NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now(),
        status public.system_status_status_enum NOT NULL DEFAULT 'install'::system_status_status_enum,
        CONSTRAINT system_status_pkey PRIMARY KEY (coopname)
      )
    `)

    try {
    // Устанавливаем начальный статус для voskhod (active - система готова к работе)
      await client.query(`
      INSERT INTO system_status (coopname, status)
      VALUES ('voskhod', 'active')
      ON CONFLICT (coopname) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `)

      // Проверяем, что статус действительно установлен
      const result = await client.query(`
        SELECT status FROM system_status WHERE coopname = 'voskhod'
      `)
      console.log('Статус системы в PostgreSQL после установки:', result.rows[0]?.status)
    }
    catch (queryError) {
      console.error('Ошибка при установке статуса системы в PostgreSQL:', queryError)
      throw queryError
    }

    console.log('Статус системы инициализирован в PostgreSQL')
  }
  catch (error) {
    console.error('Ошибка инициализации статуса системы в PostgreSQL:', error)
    throw error
  }
  finally {
    await client.end()
  }
}

export async function initUsersInPostgres(
  users: Array<{
    username: string
    email: string
    type: 'individual' | 'entrepreneur' | 'organization'
    role: string
    status: string
    is_registered: boolean
  }>,
) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  })

  try {
    await client.connect()
    console.log('Подключение к PostgreSQL установлено для инициализации пользователей')

    // Создаем таблицу users, если она не существует
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'created',
        message TEXT DEFAULT '',
        is_registered BOOLEAN DEFAULT FALSE,
        has_account BOOLEAN DEFAULT FALSE,
        type VARCHAR(20) NOT NULL,
        public_key TEXT DEFAULT '',
        referer VARCHAR(100) DEFAULT '',
        email VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        is_email_verified BOOLEAN DEFAULT FALSE,
        subscriber_id VARCHAR(100) DEFAULT '',
        subscriber_hash VARCHAR(255) DEFAULT '',
        legacy_mongo_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Создаем пользователей
    for (const user of users) {
      // Проверяем, что username не null и не пустой
      if (!user.username || user.username.trim() === '') {
        console.warn(`Пропускаем пользователя с пустым username:`, user)
        continue
      }

      await client.query(`
        INSERT INTO "users" (
          username, email, type, role, status, is_registered,
          has_account, is_email_verified, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (username) DO NOTHING
      `, [
        user.username,
        user.email,
        user.type,
        user.role,
        user.status,
        user.is_registered,
        false, // has_account
        true, // is_email_verified
      ])
    }

    console.log(`Инициализировано ${users.length} пользователей в PostgreSQL`)
  }
  catch (error) {
    console.error('Ошибка инициализации пользователей в PostgreSQL:', error)
    throw error
  }
  finally {
    await client.end()
  }
}

export async function initVaultInPostgres() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
  })

  try {
    await client.connect()
    console.log('Подключение к PostgreSQL установлено для инициализации vault')

    // Создаем таблицу vaults, если она не существует
    await client.query(`
      CREATE TABLE IF NOT EXISTS "vaults" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) NOT NULL,
        permission VARCHAR(20) DEFAULT 'active',
        wif TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(username, permission)
      )
    `)

    // Создаем индексы
    await client.query(`CREATE INDEX IF NOT EXISTS idx_vaults_username ON "vaults"(username)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_vaults_username_permission ON "vaults"(username, permission)`)

    // Сохраняем зашифрованный ключ в vault
    await client.query(`
      INSERT INTO "vaults" (username, permission, wif, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (username, permission) DO NOTHING
    `, [
      'voskhod',
      'active',
      '9d6479a9d77ead53fb0e5e54b3608a95:2046ee3c1577d48aecbee49e8f25c4c2df37ab02f15d73d0d1b6352f53a4b774cb9e71b6028fd7caf64568e195c7878dfbb5d2bf10a3766d90ba9e92ea724428',
    ])

    console.log('Vault инициализирован в PostgreSQL')
  }
  catch (error) {
    console.error('Ошибка инициализации vault в PostgreSQL:', error)
    throw error
  }
  finally {
    await client.end()
  }
}
