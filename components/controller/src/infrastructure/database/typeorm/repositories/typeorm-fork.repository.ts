import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import type { ForkRepositoryPort } from '~/domain/parser/ports/fork-repository.port';
import type { ForkDomainInterface } from '~/domain/parser/interfaces/fork-domain.interface';
import { ForkEntity } from '../entities/fork.entity';

/**
 * TypeORM реализация репозитория форков блокчейна
 */
@Injectable()
export class TypeOrmForkRepository implements ForkRepositoryPort {
  constructor(
    @InjectRepository(ForkEntity)
    private readonly forkRepository: Repository<ForkEntity>
  ) {}

  /**
   * Сохранение форка
   */
  async save(forkData: Omit<ForkDomainInterface, 'id' | 'created_at'>): Promise<ForkDomainInterface> {
    const entity = this.forkRepository.create(forkData);
    return await this.forkRepository.save(entity);
  }

  /**
   * Получение форка по ID
   */
  async findById(id: string): Promise<ForkDomainInterface | null> {
    return await this.forkRepository.findOne({ where: { id } });
  }

  /**
   * Удаление форков после указанного блока
   */
  async deleteAfterBlock(blockNum: number): Promise<void> {
    await this.forkRepository.delete({
      block_num: MoreThan(blockNum),
    });
  }

  /**
   * Получение общего количества форков
   */
  async count(): Promise<number> {
    return await this.forkRepository.count();
  }

  /**
   * Получение последнего форка по номеру блока
   */
  async findLastByBlock(): Promise<ForkDomainInterface | null> {
    return await this.forkRepository.findOne({
      order: { block_num: 'DESC' },
    });
  }
}
