import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatrixTokenRepository } from '../../domain/repositories/matrix-token.repository';
import { MatrixTokenDomainEntity } from '../../domain/entities/matrix-token.entity';
import { MatrixTokenTypeormEntity } from '../entities/matrix-token.typeorm-entity';
import { MatrixTokenMapper } from '../mappers/matrix-token.mapper';
import { CHATCOOP_CONNECTION_NAME } from '../database/chatcoop-database.constants';

@Injectable()
export class MatrixTokenTypeormRepository implements MatrixTokenRepository {
  constructor(
    @InjectRepository(MatrixTokenTypeormEntity, CHATCOOP_CONNECTION_NAME)
    private readonly repository: Repository<MatrixTokenTypeormEntity>
  ) {}

  async create(token: Omit<MatrixTokenDomainEntity, 'id' | 'createdAt'>): Promise<MatrixTokenDomainEntity> {
    const entity = this.repository.create(MatrixTokenMapper.toEntity(token));
    const savedEntity = await this.repository.save(entity);
    return MatrixTokenMapper.toDomain(savedEntity);
  }

  async findByToken(token: string): Promise<MatrixTokenDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { token } });
    return entity ? MatrixTokenMapper.toDomain(entity) : null;
  }

  async findByCoopUsername(coopUsername: string): Promise<MatrixTokenDomainEntity[]> {
    const entities = await this.repository.find({
      where: { coopUsername },
      order: { createdAt: 'DESC' },
    });
    return entities.map(MatrixTokenMapper.toDomain);
  }

  async findValidByCoopUsername(coopUsername: string): Promise<MatrixTokenDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: {
        coopUsername,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!entity) {
      return null;
    }

    // Проверяем срок действия
    if (entity.expiresAt < new Date()) {
      return null;
    }

    return MatrixTokenMapper.toDomain(entity);
  }

  async markAsUsed(id: string): Promise<void> {
    await this.repository.update(id, { isUsed: true });
  }

  async deleteExpired(): Promise<void> {
    await this.repository.delete({
      expiresAt: new Date(Date.now()),
      isUsed: false,
    });
  }

  async findById(id: string): Promise<MatrixTokenDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? MatrixTokenMapper.toDomain(entity) : null;
  }
}
