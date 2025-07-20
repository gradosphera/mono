import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import { ProjectDomainEntity } from '../../domain/entities/project.entity';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';
import { ProjectMapper } from '../mappers/project.mapper';

@Injectable()
export class ProjectTypeormRepository implements ProjectRepository {
  constructor(
    @InjectRepository(ProjectTypeormEntity)
    private readonly repository: Repository<ProjectTypeormEntity>
  ) {}

  async create(project: Omit<ProjectDomainEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectDomainEntity> {
    const entity = this.repository.create(ProjectMapper.toEntity(project));
    const savedEntity = await this.repository.save(entity);
    return ProjectMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<ProjectDomainEntity | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find();
    return entities.map(ProjectMapper.toDomain);
  }

  async findByCycleId(cycleId: string): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({ where: { cycleId } });
    return entities.map(ProjectMapper.toDomain);
  }

  async findByAuthor(contributorId: string): Promise<ProjectDomainEntity[]> {
    // Используем raw query для поиска в JSON поле
    const entities = await this.repository
      .createQueryBuilder('project')
      .where('JSON_EXTRACT(project.authors, "$[*].contributorId") LIKE :contributorId', {
        contributorId: `%"${contributorId}"%`,
      })
      .getMany();

    return entities.map(ProjectMapper.toDomain);
  }

  async findByMaster(masterId: string): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({ where: { masterId } });
    return entities.map(ProjectMapper.toDomain);
  }

  async findByStatus(status: string): Promise<ProjectDomainEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map(ProjectMapper.toDomain);
  }

  async update(id: string, project: Partial<ProjectDomainEntity>): Promise<ProjectDomainEntity> {
    const updateData = ProjectMapper.toUpdateEntity(project);
    await this.repository.update(id, updateData);

    const updatedEntity = await this.repository.findOne({ where: { id } });
    if (!updatedEntity) {
      throw new Error('Project not found after update');
    }

    return ProjectMapper.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
