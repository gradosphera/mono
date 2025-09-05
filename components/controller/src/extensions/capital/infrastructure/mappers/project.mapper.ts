import { ProjectDomainEntity } from '../../domain/entities/project.entity';
import { ProjectTypeormEntity } from '../entities/project.typeorm-entity';
import type { IProjectDomainInterfaceDatabaseData } from '../../domain/interfaces/project-database.interface';
import type { IProjectDomainInterfaceBlockchainData } from '../../domain/interfaces/project-blockchain.interface';

/**
 * Маппер для преобразования между доменной сущностью проекта и TypeORM сущностью
 */
export class ProjectMapper {
  /**
   * Преобразование TypeORM сущности в доменную сущность
   */
  static toDomain(entity: ProjectTypeormEntity): ProjectDomainEntity {
    const databaseData: IProjectDomainInterfaceDatabaseData = {
      id: entity.id,
      blockchain_id: entity.blockchain_id || 0,
      block_num: entity.block_num || null,
      present: entity.present,
    };

    // Используем данные из TypeORM сущности
    const blockchainData: IProjectDomainInterfaceBlockchainData = {
      id: entity.blockchain_id || 0,
      coopname: entity.coopname,
      project_hash: entity.project_hash,
      parent_hash: entity.parent_hash || '',
      status: entity.blockchain_status,
      is_opened: entity.is_opened,
      is_planed: entity.is_planed,
      can_convert_to_project: entity.can_convert_to_project,
      master: entity.master,
      title: entity.title,
      description: entity.description,
      meta: entity.meta || '',
      counts: entity.counts,
      plan: entity.plan,
      fact: entity.fact,
      crps: entity.crps,
      voting: entity.voting,
      membership: entity.membership,
      created_at: entity.created_at.toISOString(),
    };

    return new ProjectDomainEntity(databaseData, blockchainData);
  }

  /**
   * Преобразование доменной сущности в TypeORM сущность для создания
   */
  static toEntity(domain: Partial<ProjectDomainEntity>): Partial<ProjectTypeormEntity> {
    const entity: Partial<ProjectTypeormEntity> = {
      blockchain_id: domain.blockchain_id ? Number(domain.blockchain_id) : undefined,
      block_num: domain.block_num || undefined,
      present: domain.present,
    };

    // Поля из блокчейна
    if (domain.coopname !== undefined) entity.coopname = domain.coopname;
    if (domain.project_hash !== undefined) entity.project_hash = domain.project_hash;
    if (domain.parent_hash !== undefined) entity.parent_hash = domain.parent_hash || undefined;
    if (domain.blockchain_status !== undefined) entity.blockchain_status = domain.blockchain_status;
    if (domain.is_opened !== undefined) entity.is_opened = domain.is_opened;
    if (domain.is_planed !== undefined) entity.is_planed = domain.is_planed;
    if (domain.can_convert_to_project !== undefined) entity.can_convert_to_project = domain.can_convert_to_project;
    if (domain.master !== undefined) entity.master = domain.master;
    if (domain.title !== undefined) entity.title = domain.title;
    if (domain.description !== undefined) entity.description = domain.description;
    if (domain.meta !== undefined) entity.meta = domain.meta || undefined;
    if (domain.counts !== undefined) entity.counts = domain.counts;
    if (domain.plan !== undefined) entity.plan = domain.plan;
    if (domain.fact !== undefined) entity.fact = domain.fact;
    if (domain.crps !== undefined) entity.crps = domain.crps;
    if (domain.voting !== undefined) entity.voting = domain.voting;
    if (domain.membership !== undefined) entity.membership = domain.membership;
    if (domain.created_at !== undefined) entity.created_at = new Date(domain.created_at);

    // Доменные поля
    if (domain.status !== undefined) entity.status = domain.status;

    return entity;
  }

  /**
   * Преобразование доменной сущности в данные для обновления TypeORM сущности
   * Обновляет только локальные поля базы данных, поля из блокчейна обновляются через синхронизацию
   */
  static toUpdateEntity(domain: Partial<ProjectDomainEntity>): Partial<ProjectTypeormEntity> {
    const updateData: Partial<ProjectTypeormEntity> = {};

    // Поля из базы данных (локальные)
    if (domain.id !== undefined) updateData.blockchain_id = Number(domain.blockchain_id);
    if (domain.block_num !== undefined) updateData.block_num = domain.block_num || undefined;
    if (domain.present !== undefined) updateData.present = domain.present;

    // Примечание: Все поля из блокчейна (coopname, project_hash, status, counts, plan, fact, crps, voting, membership)
    // обновляются автоматически через систему синхронизации с блокчейном (AbstractEntitySyncService)
    // и не должны обновляться вручную через этот метод

    return updateData;
  }
}
