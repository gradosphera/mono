import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatrixUserTypeormEntity } from '../entities/matrix-user.typeorm-entity';
import { MatrixTokenTypeormEntity } from '../entities/matrix-token.typeorm-entity';
import { UnionChatTypeormEntity } from '../entities/union-chat.typeorm-entity';
import { CallTranscriptionTypeormEntity } from '../entities/call-transcription.typeorm-entity';
import { TranscriptionSegmentTypeormEntity } from '../entities/transcription-segment.typeorm-entity';
import { ManagedMatrixRoomTypeormEntity } from '../entities/managed-matrix-room.typeorm-entity';
import { RoomMessageHistoryTypeormEntity } from '../entities/room-message-history.typeorm-entity';

// Все TypeORM-сущности расширения chatcoop
const CHATCOOP_ENTITIES = [
  MatrixUserTypeormEntity,
  MatrixTokenTypeormEntity,
  UnionChatTypeormEntity,
  CallTranscriptionTypeormEntity,
  TranscriptionSegmentTypeormEntity,
  ManagedMatrixRoomTypeormEntity,
  RoomMessageHistoryTypeormEntity,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(CHATCOOP_ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class ChatCoopDatabaseModule {}
