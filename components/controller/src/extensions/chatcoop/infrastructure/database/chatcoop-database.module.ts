import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatrixUserTypeormEntity } from '../entities/matrix-user.typeorm-entity';
import { MatrixTokenTypeormEntity } from '../entities/matrix-token.typeorm-entity';
import { UnionChatTypeormEntity } from '../entities/union-chat.typeorm-entity';
import { CallTranscriptionTypeormEntity } from '../entities/call-transcription.typeorm-entity';
import { TranscriptionSegmentTypeormEntity } from '../entities/transcription-segment.typeorm-entity';

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
    TypeOrmModule.forFeature(CHATCOOP_ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class ChatCoopDatabaseModule {}
