import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GithubCommMessageCursorTypeormEntity } from '../entities/github-comm-message-cursor.typeorm-entity';
import { GithubCommTranscriptionCursorTypeormEntity } from '../entities/github-comm-transcription-cursor.typeorm-entity';

@Injectable()
export class GithubCommunicationCursorService {
  constructor(
    @InjectRepository(GithubCommMessageCursorTypeormEntity)
    private readonly messageCursor: Repository<GithubCommMessageCursorTypeormEntity>,
    @InjectRepository(GithubCommTranscriptionCursorTypeormEntity)
    private readonly transcriptionCursor: Repository<GithubCommTranscriptionCursorTypeormEntity>
  ) {}

  async getMessageLastTs(coopname: string, matrixRoomId: string): Promise<number | null> {
    const row = await this.messageCursor.findOne({ where: { coopname, matrixRoomId } });
    return row ? row.lastOriginServerTs : null;
  }

  async upsertMessageLastTs(coopname: string, matrixRoomId: string, lastOriginServerTs: number): Promise<void> {
    let row = await this.messageCursor.findOne({ where: { coopname, matrixRoomId } });
    if (!row) {
      row = this.messageCursor.create({ coopname, matrixRoomId, lastOriginServerTs });
    } else {
      row.lastOriginServerTs = lastOriginServerTs;
    }
    await this.messageCursor.save(row);
  }

  async getTranscriptionLastEndedAtExclusive(coopname: string, projectHash: string): Promise<Date | null> {
    const row = await this.transcriptionCursor.findOne({ where: { coopname, projectHash } });
    return row ? row.lastEndedAtExclusive : null;
  }

  async upsertTranscriptionLastEndedAtExclusive(
    coopname: string,
    projectHash: string,
    lastEndedAtExclusive: Date
  ): Promise<void> {
    let row = await this.transcriptionCursor.findOne({ where: { coopname, projectHash } });
    if (!row) {
      row = this.transcriptionCursor.create({ coopname, projectHash, lastEndedAtExclusive });
    } else {
      row.lastEndedAtExclusive = lastEndedAtExclusive;
    }
    await this.transcriptionCursor.save(row);
  }
}
