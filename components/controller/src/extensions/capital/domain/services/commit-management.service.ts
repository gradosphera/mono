import { Inject, Injectable } from '@nestjs/common';
import { CommitDomainEntity, CommitStatus } from '../entities/commit.entity';
import { AssignmentDomainEntity, AssignmentStatus } from '../entities/assignment.entity';
import { COMMIT_REPOSITORY, CommitRepository } from '../repositories/commit.repository';
import { ASSIGNMENT_REPOSITORY, AssignmentRepository } from '../repositories/assignment.repository';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../repositories/contributor.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../repositories/project.repository';

@Injectable()
export class CommitManagementService {
  constructor(
    @Inject(COMMIT_REPOSITORY) private readonly commitRepository: CommitRepository,
    @Inject(ASSIGNMENT_REPOSITORY) private readonly assignmentRepository: AssignmentRepository,
    @Inject(CONTRIBUTOR_REPOSITORY) private readonly contributorRepository: ContributorRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository
  ) {}

  async createAssignment(data: {
    projectId: string;
    title: string;
    description: string;
    masterId: string;
    estimatedHours: number;
    estimatedExpenses: number;
    stories: Array<{ description: string }>;
  }): Promise<AssignmentDomainEntity> {
    // Валидация проекта
    const project = await this.projectRepository.findById(data.projectId);
    if (!project) {
      throw new Error('Проект не найден');
    }

    // Валидация мастера
    const master = await this.contributorRepository.findById(data.masterId);
    if (!master) {
      throw new Error('Мастер не найден');
    }

    const storiesWithIds = data.stories.map((story, index) => ({
      id: `story_${Date.now()}_${index}`,
      description: story.description,
      isCompleted: false,
    }));

    const assignment = await this.assignmentRepository.create({
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: AssignmentStatus.DRAFT,
      masterId: data.masterId,
      assignedCreators: [],
      estimatedHours: data.estimatedHours,
      estimatedExpenses: data.estimatedExpenses,
      actualHours: 0,
      actualExpenses: 0,
      allocatedInvestment: 0,
      availableForLoan: 0,
      stories: storiesWithIds,
    });

    return assignment;
  }

  async submitCommit(data: {
    assignmentId: string;
    creatorId: string;
    title: string;
    description: string;
    hoursSpent: number;
    externalRepoUrl?: string;
    externalDbReference?: string;
  }): Promise<CommitDomainEntity> {
    // Валидация задания
    const assignment = await this.assignmentRepository.findById(data.assignmentId);
    if (!assignment) {
      throw new Error('Задание не найдено');
    }

    if (assignment.status !== AssignmentStatus.OPEN && assignment.status !== AssignmentStatus.IN_PROGRESS) {
      throw new Error('Задание не открыто для приёма коммитов');
    }

    // Валидация создателя
    const creator = await this.contributorRepository.findById(data.creatorId);
    if (!creator) {
      throw new Error('Создатель не найден');
    }

    // Проверка что создатель назначен на задание
    if (!assignment.assignedCreators.includes(data.creatorId)) {
      throw new Error('Создатель не назначен на это задание');
    }

    const totalCost = data.hoursSpent * creator.personalHourCost;

    const commit = await this.commitRepository.create({
      assignmentId: data.assignmentId,
      creatorId: data.creatorId,
      title: data.title,
      description: data.description,
      externalRepoUrl: data.externalRepoUrl,
      externalDbReference: data.externalDbReference,
      hoursSpent: data.hoursSpent,
      hourRate: creator.personalHourCost,
      totalCost: totalCost,
      status: CommitStatus.SUBMITTED,
    });

    // Обновляем статус задания если это первый коммит
    if (assignment.status === AssignmentStatus.OPEN) {
      await this.assignmentRepository.update(data.assignmentId, {
        status: AssignmentStatus.IN_PROGRESS,
      });
    }

    return commit;
  }

  async reviewCommit(
    commitId: string,
    masterId: string,
    isAccepted: boolean,
    comment?: string
  ): Promise<CommitDomainEntity> {
    const commit = await this.commitRepository.findById(commitId);
    if (!commit) {
      throw new Error('Коммит не найден');
    }

    const assignment = await this.assignmentRepository.findById(commit.assignmentId);
    if (!assignment || assignment.masterId !== masterId) {
      throw new Error('Только мастер задания может принимать коммиты');
    }

    const newStatus = isAccepted ? CommitStatus.ACCEPTED : CommitStatus.REJECTED;

    const updatedCommit = await this.commitRepository.update(commitId, {
      status: newStatus,
      reviewedBy: masterId,
      reviewComment: comment,
      reviewedAt: new Date(),
    });

    // Если коммит принят, обновляем фактические часы в задании
    if (isAccepted) {
      await this.assignmentRepository.update(commit.assignmentId, {
        actualHours: assignment.actualHours + commit.hoursSpent,
      });

      // Обновляем фактические часы в проекте
      const project = await this.projectRepository.findById(assignment.projectId);
      if (project) {
        await this.projectRepository.update(project.id, {
          actualHours: project.actualHours + commit.hoursSpent,
        });
      }
    }

    return updatedCommit;
  }

  async completeAssignment(assignmentId: string, masterId: string): Promise<AssignmentDomainEntity> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error('Задание не найдено');
    }

    if (assignment.masterId !== masterId) {
      throw new Error('Только мастер может завершить задание');
    }

    // Проверяем что все ведущие истории выполнены
    const uncompletedStories = assignment.stories.filter((story) => !story.isCompleted);
    if (uncompletedStories.length > 0) {
      throw new Error('Не все ведущие истории выполнены');
    }

    const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
      status: AssignmentStatus.COMPLETED,
      completedAt: new Date(),
    });

    return updatedAssignment;
  }

  async markStoryCompleted(assignmentId: string, storyId: string, masterId: string): Promise<AssignmentDomainEntity> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error('Задание не найдено');
    }

    if (assignment.masterId !== masterId) {
      throw new Error('Только мастер может отмечать истории как выполненные');
    }

    const updatedStories = assignment.stories.map((story) =>
      story.id === storyId ? { ...story, isCompleted: true, completedAt: new Date() } : story
    );

    const updatedAssignment = await this.assignmentRepository.update(assignmentId, {
      stories: updatedStories,
    });

    return updatedAssignment;
  }
}
