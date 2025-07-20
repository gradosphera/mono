import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContributorRepository } from '../../domain/repositories/contributor.repository';
import { ContributorDomainEntity } from '../../domain/entities/contributor.entity';
import { ContributorTypeormEntity } from '../entities/contributor.typeorm-entity';

@Injectable()
export class ContributorTypeormRepository implements ContributorRepository {
  constructor(
    @InjectRepository(ContributorTypeormEntity, 'capital')
    private readonly repository: Repository<ContributorTypeormEntity>
  ) {}

  async create(
    contributor: Omit<ContributorDomainEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ContributorDomainEntity> {
    const entity = this.repository.create(contributor);
    return await this.repository.save(entity);
  }

  async findById(id: string): Promise<ContributorDomainEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByUserId(userId: string): Promise<ContributorDomainEntity | null> {
    return await this.repository.findOne({ where: { userId } });
  }

  async findAll(): Promise<ContributorDomainEntity[]> {
    return await this.repository.find();
  }

  async findByRole(role: string): Promise<ContributorDomainEntity[]> {
    return await this.repository
      .createQueryBuilder('contributor')
      .where(':role = ANY(contributor.roles)', { role })
      .getMany();
  }

  async findActive(): Promise<ContributorDomainEntity[]> {
    return await this.repository.find({ where: { isActive: true } });
  }

  async update(id: string, contributor: Partial<ContributorDomainEntity>): Promise<ContributorDomainEntity> {
    await this.repository.update(id, contributor);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) throw new Error('Contributor not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
