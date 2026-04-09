import { Inject, Injectable } from '@nestjs/common';
import type { InterProjectCapitalClearancePort } from '@coopenomics/inter';
import {
  APPENDIX_REPOSITORY,
  type AppendixRepository,
} from '../../domain/repositories/appendix.repository';

@Injectable()
export class CapitalInterProjectCapitalClearanceAdapter implements InterProjectCapitalClearancePort {
  constructor(
    @Inject(APPENDIX_REPOSITORY)
    private readonly appendixRepository: AppendixRepository
  ) {}

  async listUsernamesWithConfirmedProjectClearance(projectHash: string): Promise<string[]> {
    return this.appendixRepository.findDistinctUsernamesWithConfirmedClearanceByProjectHash(projectHash);
  }
}
