import { z } from 'zod';
import { config } from 'dotenv';

// Загружаем переменные окружения
config();

// Определяем схему валидации без необходимости указывать сообщения
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PROVIDER_DB_HOST: z.string(),
  PROVIDER_DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('5432'),
  PROVIDER_DB_USERNAME: z.string(),
  PROVIDER_DB_PASSWORD: z.string(),
  PROVIDER_DB_DATABASE: z.string(),
  CHAIN_URL: z.string().url(),
  CHAIN_ID: z.string(),
  SEMAPHORE_API_URL: z.string().url(),
  SEMAPHORE_USERNAME: z.string(),
  SEMAPHORE_PASSWORD: z.string(),
  SEMAPHORE_PROJECT_ID: z.string().transform((val) => parseInt(val, 10)),
  SEMAPHORE_INVENTORY_ID: z.string().transform((val) => parseInt(val, 10)),
  SEMAPHORE_SSH_KEY_ID: z.string().transform((val) => parseInt(val, 10)),
  SEMAPHORE_INVENTORY_NAME: z.string(),
  SEMAPHORE_TEMPLATE_ID: z.string().transform((val) => parseInt(val, 10)),
  SERVER_IP: z.string().refine(
    (ip) => {
      const ipRegex =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipRegex.test(ip);
    },
    { message: 'Invalid IP address' },
  ),
  SEMAPHORE_SETUP_PLAYBOOK: z.string(),
  PROVIDER_ACCOUNT: z.string(),
  PROVIDER_WIF: z.string(),
  START_TOKENS: z.string(), // если нужно можно добавить валидацию формата
  SERVER_SECRET: z.string(),
  PROVIDER_URL: z.string().url(),
  // VAULT
  VAULT_TOKEN: z.string(),
  VAULT_ENDPOINT: z.string(),

  // NEXTCLOUD
  NEXTCLOUD_BASE_URL: z.string(),
  NEXTCLOUD_USERNAME: z.string(),
  NEXTCLOUD_PASSWORD: z.string(),

  // REDIS
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_PASSWORD: z.string(),
});

// Валидация переменных окружения с единым сообщением об отсутствии полей
export function validateEnv() {
  const parsedEnv = envSchema.safeParse(process.env);

  if (!parsedEnv.success) {
    const formattedErrors = parsedEnv.error.format();

    const errorMessages = Object.keys(formattedErrors)
      .filter((key) => key !== '_errors')
      .map((key) => `${key}: параметр не установлен`)
      .join('\n');

    console.error('❌ Ошибка конфигурации:\n', errorMessages);
    process.exit(1); // Завершаем приложение в случае ошибки
  }

  return parsedEnv.data; // Возвращаем валидированные данные
}
