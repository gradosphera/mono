import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnionChatRepository } from '../../domain/repositories/union-chat.repository';
import { UnionChatDomainEntity } from '../../domain/entities/union-chat.entity';
import { UnionChatTypeormEntity } from '../entities/union-chat.typeorm-entity';
import { UnionChatMapper } from '../mappers/union-chat.mapper';
import { CHATCOOP_CONNECTION_NAME } from '../database/chatcoop-database.constants';

@Injectable()
export class UnionChatTypeormRepository implements UnionChatRepository {
  constructor(
    @InjectRepository(UnionChatTypeormEntity, CHATCOOP_CONNECTION_NAME)
    private readonly repository: Repository<UnionChatTypeormEntity>
  ) {}

  async create(data: Omit<UnionChatDomainEntity, 'id' | 'createdAt'>): Promise<UnionChatDomainEntity> {
    const entity = this.repository.create(UnionChatMapper.toEntity(data));
    const saved = await this.repository.save(entity);
    return UnionChatMapper.toDomain(saved as UnionChatTypeormEntity);
  }

  async findByCoopUsername(coopUsername: string): Promise<UnionChatDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { coopUsername } });
    return entity ? UnionChatMapper.toDomain(entity) : null;
  }

  async findByRoomId(roomId: string): Promise<UnionChatDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { roomId } });
    return entity ? UnionChatMapper.toDomain(entity) : null;
  }
}
