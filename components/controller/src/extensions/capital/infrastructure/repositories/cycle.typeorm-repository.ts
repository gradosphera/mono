import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CycleRepository } from '../../domain/repositories/cycle.repository';
import { CycleDomainEntity } from '../../domain/entities/cycle.entity';
import { CycleTypeormEntity } from '../entities/cycle.typeorm-entity';

@Injectable()
export class CycleTypeormRepository implements CycleRepository {
  constructor(
    @InjectRepository(CycleTypeormEntity, 'capital')
    private readonly repository: Repository<CycleTypeormEntity>
  ) {}

  async create(cycle: Omit<CycleDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CycleDomainEntity> {
    const entity = this.repository.create(cycle);
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<CycleDomainEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<CycleDomainEntity[]> {
    return await this.repository.find();
  }

  async update(id: string, cycle: Partial<CycleDomainEntity>): Promise<CycleDomainEntity> {
    await this.repository.update(id, cycle);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) throw new Error('Cycle not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByStatus(status: string): Promise<CycleDomainEntity[]> {
    return await this.repository.find({ where: { status: status as any } });
  }
}
