import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CapitalApplicationService } from '../services/capital-application.service';
import { CreateAssignmentRequestInputDTO, AssignmentResponseDTO } from '../dto/create-assignment.dto';

@Resolver(() => AssignmentResponseDTO)
export class AssignmentResolver {
  constructor(private readonly capitalAppService: CapitalApplicationService) {}

  @Mutation(() => AssignmentResponseDTO)
  async createAssignment(@Args('data') data: CreateAssignmentRequestInputDTO): Promise<AssignmentResponseDTO> {
    return await this.capitalAppService.createAssignment(data);
  }

  @Query(() => [AssignmentResponseDTO])
  async getAssignmentsByProject(@Args('projectId', { type: () => ID }) projectId: string): Promise<AssignmentResponseDTO[]> {
    // Заглушка
    return [];
  }

  @Mutation(() => AssignmentResponseDTO)
  async completeAssignment(
    @Args('assignmentId', { type: () => ID }) assignmentId: string,
    @Args('masterId', { type: () => ID }) masterId: string
  ): Promise<AssignmentResponseDTO> {
    return await this.capitalAppService.completeAssignment(assignmentId, masterId);
  }

  @Mutation(() => AssignmentResponseDTO)
  async markStoryCompleted(
    @Args('assignmentId', { type: () => ID }) assignmentId: string,
    @Args('storyId', { type: () => ID }) storyId: string,
    @Args('masterId', { type: () => ID }) masterId: string
  ): Promise<AssignmentResponseDTO> {
    return await this.capitalAppService.markStoryCompleted(assignmentId, storyId, masterId);
  }
}
