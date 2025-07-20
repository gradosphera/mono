import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CapitalApplicationService } from '../services/capital-application.service';
import { CreateCommitRequestInputDTO, CommitResponseDTO, ReviewCommitRequestInputDTO } from '../dto/create-commit.dto';

@Resolver(() => CommitResponseDTO)
export class CommitResolver {
  constructor(private readonly capitalAppService: CapitalApplicationService) {}

  @Mutation(() => CommitResponseDTO)
  async submitCommit(@Args('data') data: CreateCommitRequestInputDTO): Promise<CommitResponseDTO> {
    return await this.capitalAppService.submitCommit(data);
  }

  @Mutation(() => CommitResponseDTO)
  async reviewCommit(@Args('data') data: ReviewCommitRequestInputDTO): Promise<CommitResponseDTO> {
    return await this.capitalAppService.reviewCommit(data);
  }

  @Query(() => [CommitResponseDTO])
  async getCommitsByAssignment(
    @Args('assignmentId', { type: () => ID }) assignmentId: string
  ): Promise<CommitResponseDTO[]> {
    // Заглушка
    return [];
  }

  @Query(() => [CommitResponseDTO])
  async getPendingCommitsForReview(): Promise<CommitResponseDTO[]> {
    // Заглушка для получения коммитов ожидающих проверки
    return [];
  }
}
