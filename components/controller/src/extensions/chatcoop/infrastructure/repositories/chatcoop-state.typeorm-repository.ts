import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ChatcoopStateDomainEntity } from '../../domain/entities/chatcoop-state.entity';
import { CHATCOOP_STATE_SINGLETON_ID } from '../../domain/chatcoop-state.constants';
import type { ChatcoopStateMergeInput, ChatcoopStateRepository } from '../../domain/repositories/chatcoop-state.repository';
import { ChatcoopStateTypeormEntity } from '../entities/chatcoop-state.typeorm-entity';

@Injectable()
export class ChatcoopStateTypeormRepository implements ChatcoopStateRepository {
  constructor(
    @InjectRepository(ChatcoopStateTypeormEntity)
    private readonly repository: Repository<ChatcoopStateTypeormEntity>
  ) {}

  async getSingleton(): Promise<ChatcoopStateDomainEntity> {
    const row = await this.loadOrCreateRow();
    return this.toDomain(row);
  }

  async merge(input: ChatcoopStateMergeInput): Promise<ChatcoopStateDomainEntity> {
    const row = await this.loadOrCreateRow();
    if (input.spaceId !== undefined) {
      row.spaceId = input.spaceId;
    }
    if (input.isInitialized !== undefined) {
      row.isInitialized = input.isInitialized;
    }
    if (input.secretaryMatrixUserId !== undefined) {
      row.secretaryMatrixUserId = input.secretaryMatrixUserId;
    }
    if (input.secretaryInitialized !== undefined) {
      row.secretaryInitialized = input.secretaryInitialized;
    }
    if (input.secretaryUsername !== undefined) {
      row.secretaryUsername = input.secretaryUsername;
    }
    if (input.secretaryPasswordEncrypted !== undefined) {
      row.secretaryPasswordEncrypted = input.secretaryPasswordEncrypted;
    }
    await this.repository.save(row);
    return this.toDomain(row);
  }

  private async loadOrCreateRow(): Promise<ChatcoopStateTypeormEntity> {
    let row = await this.repository.findOne({ where: { id: CHATCOOP_STATE_SINGLETON_ID } });
    if (!row) {
      row = this.repository.create({
        id: CHATCOOP_STATE_SINGLETON_ID,
        spaceId: null,
        isInitialized: false,
        secretaryMatrixUserId: null,
        secretaryInitialized: false,
        secretaryUsername: null,
        secretaryPasswordEncrypted: null,
      });
      await this.repository.save(row);
    }
    return row;
  }

  private toDomain(row: ChatcoopStateTypeormEntity): ChatcoopStateDomainEntity {
    return {
      id: row.id,
      spaceId: row.spaceId,
      isInitialized: row.isInitialized,
      secretaryMatrixUserId: row.secretaryMatrixUserId,
      secretaryInitialized: row.secretaryInitialized,
      secretaryUsername: row.secretaryUsername,
      secretaryPasswordEncrypted: row.secretaryPasswordEncrypted,
    };
  }
}
