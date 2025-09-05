import { DataSource } from 'typeorm';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  username: process.env.POSTGRES_USERNAME || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DATABASE || 'coop',
  entities: [path.join(__dirname, 'src/infrastructure/database/typeorm/entities/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src/infrastructure/database/typeorm/migrations/*.ts')],
  migrationsRun: true,
  synchronize: false,
  logging: false,
});
