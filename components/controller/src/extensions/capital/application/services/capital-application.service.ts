import { Injectable } from '@nestjs/common';
import { ProjectManagementService } from '../../domain/services/project-management.service';
import { CommitManagementService } from '../../domain/services/commit-management.service';
import { ResultCalculationService } from '../../domain/services/result-calculation.service';
import { CreateProjectRequestInputDTO, ProjectResponseDTO } from '../dto/create-project.dto';
import { CreateAssignmentRequestInputDTO, AssignmentResponseDTO } from '../dto/create-assignment.dto';
import { CreateCommitRequestInputDTO, CommitResponseDTO, ReviewCommitRequestInputDTO } from '../dto/create-commit.dto';
import { ProjectDomainEntity } from '../../domain/entities/project.entity';
import { AssignmentDomainEntity } from '../../domain/entities/assignment.entity';
import { CommitDomainEntity } from '../../domain/entities/commit.entity';
import { ResultShareDomainEntity } from '../../domain/entities/result-share.entity';

@Injectable()
export class CapitalApplicationService {
  constructor(
    private readonly projectManagementService: ProjectManagementService,
    private readonly commitManagementService: CommitManagementService,
    private readonly resultCalculationService: ResultCalculationService
  ) {}

  async createProject(data: CreateProjectRequestInputDTO): Promise<ProjectResponseDTO> {
    const project = await this.projectManagementService.createProject({
      cycleId: data.cycleId,
      title: data.title,
      description: data.description,
      authors: data.authors.map((author) => ({
        contributorId: author.contributorId,
        sharePercent: author.sharePercent,
      })),
      masterId: data.masterId,
    });

    return this.mapProjectToDTO(project);
  }

  async createAssignment(data: CreateAssignmentRequestInputDTO): Promise<AssignmentResponseDTO> {
    const assignment = await this.commitManagementService.createAssignment({
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      masterId: data.masterId,
      estimatedHours: data.estimatedHours,
      estimatedExpenses: data.estimatedExpenses,
      stories: data.stories.map((story) => ({ description: story.description })),
    });

    return this.mapAssignmentToDTO(assignment);
  }

  async submitCommit(data: CreateCommitRequestInputDTO): Promise<CommitResponseDTO> {
    const commit = await this.commitManagementService.submitCommit({
      assignmentId: data.assignmentId,
      creatorId: data.creatorId,
      title: data.title,
      description: data.description,
      hoursSpent: data.hoursSpent,
      externalRepoUrl: data.externalRepoUrl,
      externalDbReference: data.externalDbReference,
    });

    return this.mapCommitToDTO(commit);
  }

  async reviewCommit(data: ReviewCommitRequestInputDTO): Promise<CommitResponseDTO> {
    const commit = await this.commitManagementService.reviewCommit(
      data.commitId,
      data.masterId,
      data.isAccepted,
      data.comment
    );

    return this.mapCommitToDTO(commit);
  }

  async completeAssignment(assignmentId: string, masterId: string): Promise<AssignmentResponseDTO> {
    const assignment = await this.commitManagementService.completeAssignment(assignmentId, masterId);
    return this.mapAssignmentToDTO(assignment);
  }

  async markStoryCompleted(assignmentId: string, storyId: string, masterId: string): Promise<AssignmentResponseDTO> {
    const assignment = await this.commitManagementService.markStoryCompleted(assignmentId, storyId, masterId);
    return this.mapAssignmentToDTO(assignment);
  }

  async calculateProjectShares(projectId: string): Promise<ResultShareDomainEntity[]> {
    return await this.resultCalculationService.calculateProjectShares(projectId);
  }

  async distributeShares(projectId: string): Promise<void> {
    await this.resultCalculationService.distributeShares(projectId);
  }

  // Mapping methods
  private mapProjectToDTO(project: ProjectDomainEntity): ProjectResponseDTO {
    return {
      id: project.id,
      cycleId: project.cycleId,
      title: project.title,
      description: project.description,
      status: project.status,
      authors: project.authors.map((author) => ({
        contributorId: author.contributorId,
        sharePercent: author.sharePercent,
      })),
      masterId: project.masterId,
      plannedHours: project.plannedHours,
      actualHours: project.actualHours,
      totalInvestment: project.totalInvestment,
      createdAt: project.createdAt,
    };
  }

  private mapAssignmentToDTO(assignment: AssignmentDomainEntity): AssignmentResponseDTO {
    return {
      id: assignment.id,
      projectId: assignment.projectId,
      title: assignment.title,
      description: assignment.description,
      status: assignment.status,
      masterId: assignment.masterId,
      assignedCreators: assignment.assignedCreators,
      estimatedHours: assignment.estimatedHours,
      actualHours: assignment.actualHours,
      stories: assignment.stories.map((story) => ({
        id: story.id,
        description: story.description,
        isCompleted: story.isCompleted,
        completedAt: story.completedAt,
      })),
      createdAt: assignment.createdAt,
    };
  }

  private mapCommitToDTO(commit: CommitDomainEntity): CommitResponseDTO {
    return {
      id: commit.id,
      assignmentId: commit.assignmentId,
      creatorId: commit.creatorId,
      title: commit.title,
      description: commit.description,
      hoursSpent: commit.hoursSpent,
      hourRate: commit.hourRate,
      totalCost: commit.totalCost,
      status: commit.status,
      reviewedBy: commit.reviewedBy,
      reviewComment: commit.reviewComment,
      reviewedAt: commit.reviewedAt,
      createdAt: commit.createdAt,
    };
  }
}
