import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatrixUserRepository } from '../../domain/repositories/matrix-user.repository';
import { MatrixUserDomainEntity } from '../../domain/entities/matrix-user.entity';
import { MatrixUserTypeormEntity } from '../entities/matrix-user.typeorm-entity';
import { MatrixUserMapper } from '../mappers/matrix-user.mapper';
import { CHATCOOP_CONNECTION_NAME } from '../database/chatcoop-database.constants';

@Injectable()
export class MatrixUserTypeormRepository implements MatrixUserRepository {
  constructor(
    @InjectRepository(MatrixUserTypeormEntity, CHATCOOP_CONNECTION_NAME)
    private readonly repository: Repository<MatrixUserTypeormEntity>
  ) {}

  async create(user: Omit<MatrixUserDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<MatrixUserDomainEntity> {
    const entity = this.repository.create(MatrixUserMapper.toEntity(user));
    const savedEntity = await this.repository.save(entity);
    return MatrixUserMapper.toDomain(savedEntity);
  }

  async findByCoopUsername(coopUsername: string): Promise<MatrixUserDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { coopUsername } });
    return entity ? MatrixUserMapper.toDomain(entity) : null;
  }

  async findByMatrixUserId(matrixUserId: string): Promise<MatrixUserDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { matrixUserId } });
    return entity ? MatrixUserMapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<MatrixUserDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? MatrixUserMapper.toDomain(entity) : null;
  }

  async update(id: string, user: Partial<MatrixUserDomainEntity>): Promise<MatrixUserDomainEntity> {
    const updateData = MatrixUserMapper.toUpdateEntity(user);
    await this.repository.update(id, updateData);

    const updatedEntity = await this.repository.findOne({ where: { id } });
    if (!updatedEntity) {
      throw new Error('Matrix user not found after update');
    }

    return MatrixUserMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findAll(): Promise<MatrixUserDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map(MatrixUserMapper.toDomain);
  }
}
