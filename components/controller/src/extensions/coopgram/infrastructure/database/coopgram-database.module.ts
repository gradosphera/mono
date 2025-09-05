import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatrixUserTypeormEntity } from '../entities/matrix-user.typeorm-entity';
import { MatrixTokenTypeormEntity } from '../entities/matrix-token.typeorm-entity';
import { config } from '~/config';
import { COOPGRAM_CONNECTION_NAME } from './coopgram-database.constants';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: COOPGRAM_CONNECTION_NAME,
      useFactory: () => ({
        type: 'postgres',
        host: config.postgres.host,
        port: Number(config.postgres.port),
        username: config.postgres.username,
        password: config.postgres.password,
        database: config.postgres.database,

        entities: [MatrixUserTypeormEntity, MatrixTokenTypeormEntity],
        synchronize: true, // В продакшене использовать миграции
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([MatrixUserTypeormEntity, MatrixTokenTypeormEntity], COOPGRAM_CONNECTION_NAME),
  ],
  exports: [TypeOrmModule],
})
export class CoopgramDatabaseModule {}
