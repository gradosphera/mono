import { UnionChatDomainEntity } from '../entities/union-chat.entity';

export interface UnionChatRepository {
  create(data: Omit<UnionChatDomainEntity, 'id' | 'createdAt'>): Promise<UnionChatDomainEntity>;
  findByCoopUsername(coopUsername: string): Promise<UnionChatDomainEntity | null>;
  findByRoomId(roomId: string): Promise<UnionChatDomainEntity | null>;
}

export const UNION_CHAT_REPOSITORY = Symbol('UnionChatRepository');
