import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatrixUserTypeormEntity } from '../entities/matrix-user.typeorm-entity';
import { MatrixTokenTypeormEntity } from '../entities/matrix-token.typeorm-entity';
import { UnionChatTypeormEntity } from '../entities/union-chat.typeorm-entity';
import { CallTranscriptionTypeormEntity } from '../entities/call-transcription.typeorm-entity';
import { TranscriptionSegmentTypeormEntity } from '../entities/transcription-segment.typeorm-entity';
import { config } from '~/config';
import { CHATCOOP_CONNECTION_NAME } from './chatcoop-database.constants';

// Все TypeORM-сущности расширения chatcoop
const CHATCOOP_ENTITIES = [
  MatrixUserTypeormEntity,
  MatrixTokenTypeormEntity,
  UnionChatTypeormEntity,
  CallTranscriptionTypeormEntity,
  TranscriptionSegmentTypeormEntity,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: CHATCOOP_CONNECTION_NAME,
      useFactory: () => ({
        type: 'postgres',
        host: config.postgres.host,
        port: Number(config.postgres.port),
        username: config.postgres.username,
        password: config.postgres.password,
        database: config.postgres.database,

        entities: CHATCOOP_ENTITIES,
        synchronize: true, // В продакшене использовать миграции
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature(CHATCOOP_ENTITIES, CHATCOOP_CONNECTION_NAME),
  ],
  exports: [TypeOrmModule],
})
export class ChatCoopDatabaseModule {}
