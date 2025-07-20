import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CapitalApplicationService } from '../services/capital-application.service';
import { CreateProjectRequestInputDTO, ProjectResponseDTO } from '../dto/create-project.dto';
import { ProjectStatus } from '../../domain/entities/project.entity';

@Resolver(() => ProjectResponseDTO)
export class ProjectResolver {
  constructor(private readonly capitalAppService: CapitalApplicationService) {}

  @Mutation(() => ProjectResponseDTO)
  async createProject(@Args('data') data: CreateProjectRequestInputDTO): Promise<ProjectResponseDTO> {
    return await this.capitalAppService.createProject(data);
  }

  @Query(() => [ProjectResponseDTO])
  async getProjects(): Promise<ProjectResponseDTO[]> {
    // Здесь должен быть вызов к repository через service
    // Пока заглушка
    return [];
  }

  @Query(() => ProjectResponseDTO, { nullable: true })
  async getProject(@Args('id', { type: () => ID }) id: string): Promise<ProjectResponseDTO | null> {
    // Здесь должен быть вызов к repository через service
    // Пока заглушка
    return null;
  }

  @Mutation(() => ProjectResponseDTO)
  async updateProjectStatus(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('status') status: ProjectStatus
  ): Promise<ProjectResponseDTO> {
    // Здесь должен быть вызов к ProjectManagementService.updateProjectStatus
    // Пока заглушка
    throw new Error('Not implemented');
  }

  @Mutation(() => ProjectResponseDTO)
  async assignMasterToProject(
    @Args('projectId', { type: () => ID }) projectId: string,
    @Args('masterId', { type: () => ID }) masterId: string
  ): Promise<ProjectResponseDTO> {
    // Здесь должен быть вызов к ProjectManagementService.assignMaster
    // Пока заглушка
    throw new Error('Not implemented');
  }
}
