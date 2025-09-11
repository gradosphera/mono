import { Injectable } from '@nestjs/common';
import { GenerationInteractor } from '../../domain/interactors/generation.interactor';
import type { CreateCommitInputDTO } from '../dto/generation/create-commit-input.dto';
import type { RefreshSegmentInputDTO } from '../dto/generation/refresh-segment-input.dto';
import type { TransactResult } from '@wharfkit/session';

/**
 * Сервис уровня приложения для генерации в CAPITAL
 * Обрабатывает запросы от GenerationResolver
 */
@Injectable()
export class GenerationService {
  constructor(private readonly generationInteractor: GenerationInteractor) {}

  /**
   * Создание коммита в CAPITAL контракте
   */
  async createCommit(data: CreateCommitInputDTO): Promise<TransactResult> {
    return await this.generationInteractor.createCommit(data);
  }

  /**
   * Обновление сегмента в CAPITAL контракте
   */
  async refreshSegment(data: RefreshSegmentInputDTO): Promise<TransactResult> {
    return await this.generationInteractor.refreshSegment(data);
  }
}
