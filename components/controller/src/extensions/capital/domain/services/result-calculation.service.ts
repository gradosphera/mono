import { Inject, Injectable } from '@nestjs/common';
import { ResultShareDomainEntity, ShareType } from '../interfaces/result-share.entity';
import { RESULT_SHARE_REPOSITORY, ResultShareRepository } from '../repositories/result-share.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../repositories/project.repository';
import { COMMIT_REPOSITORY, CommitRepository } from '../repositories/commit.repository';
import { CONTRIBUTOR_REPOSITORY, ContributorRepository } from '../repositories/contributor.repository';
import { CommitStatus } from '../interfaces/commit.entity';

@Injectable()
export class ResultCalculationService {
  constructor(
    @Inject(RESULT_SHARE_REPOSITORY) private readonly resultShareRepository: ResultShareRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(COMMIT_REPOSITORY) private readonly commitRepository: CommitRepository,
    @Inject(CONTRIBUTOR_REPOSITORY) private readonly contributorRepository: ContributorRepository
  ) {}

  async calculateProjectShares(projectId: string): Promise<ResultShareDomainEntity[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Проект не найден');
    }

    // Получаем все принятые коммиты по проекту через задания
    const assignments = await this.getProjectAssignments(projectId);
    const allCommits = await this.getAcceptedCommitsForProject(assignments);

    // Группируем коммиты по создателям
    const creatorStats = this.groupCommitsByCreator(allCommits);

    // Рассчитываем доли для каждого участника
    const shares: ResultShareDomainEntity[] = [];

    // 1. Доли создателей
    for (const [creatorId, stats] of creatorStats.entries()) {
      const creatorShare = await this.calculateCreatorShare(projectId, creatorId, stats);
      shares.push(creatorShare);
    }

    // 2. Доли авторов
    for (const author of project.authors) {
      const authorShare = await this.calculateAuthorShare(
        projectId,
        author.contributorId,
        author.sharePercent,
        creatorStats
      );
      shares.push(authorShare);
    }

    // 3. Доля координатора (заглушка)
    if (project.masterId) {
      const coordinatorShare = await this.calculateCoordinatorShare(projectId, project.masterId);
      shares.push(coordinatorShare);
    }

    // Сохраняем рассчитанные доли
    for (const share of shares) {
      await this.resultShareRepository.create({
        projectId: share.projectId,
        contributorId: share.contributorId,
        type: share.type,
        timeSpent: share.timeSpent,
        hourRate: share.hourRate,
        baseCost: share.baseCost,
        creatorBonus: share.creatorBonus,
        authorBonus: share.authorBonus,
        loanReceived: share.loanReceived,
        finalShare: share.finalShare,
        sharePercent: share.sharePercent,
        isCalculated: true,
        isDistributed: false,
        calculationDetails: share.calculationDetails,
      });
    }

    return shares;
  }

  private async getProjectAssignments(projectId: string) {
    // Здесь должен быть вызов AssignmentRepository
    // Пока заглушка
    return [];
  }

  private async getAcceptedCommitsForProject(assignments: any[]) {
    // Получаем все принятые коммиты для заданий проекта
    const allCommits: any[] = [];
    for (const assignment of assignments) {
      const commits = await this.commitRepository.findByAssignmentId(assignment.id);
      const acceptedCommits = commits.filter((commit) => commit.status === CommitStatus.ACCEPTED);
      allCommits.push(...acceptedCommits);
    }
    return allCommits;
  }

  private groupCommitsByCreator(commits: any[]) {
    const creatorStats = new Map();

    for (const commit of commits) {
      if (!creatorStats.has(commit.creatorId)) {
        creatorStats.set(commit.creatorId, {
          totalHours: 0,
          totalCost: 0,
          commits: [],
        });
      }

      const stats = creatorStats.get(commit.creatorId);
      stats.totalHours += commit.hoursSpent;
      stats.totalCost += commit.totalCost;
      stats.commits.push(commit);
    }

    return creatorStats;
  }

  private async calculateCreatorShare(projectId: string, creatorId: string, stats: any): Promise<ResultShareDomainEntity> {
    // ЗАГЛУШКА МАТЕМАТИЧЕСКОГО ЯДРА
    // Здесь должна быть сложная формула из ТЗ

    const baseCost = stats.totalCost;
    const creatorBonus = baseCost; // 100% премия создателю
    const finalShare = baseCost + creatorBonus;

    return {
      id: `share_${Date.now()}_${creatorId}`,
      projectId,
      contributorId: creatorId,
      type: ShareType.CREATOR,
      timeSpent: stats.totalHours,
      hourRate: stats.totalCost / stats.totalHours, // средняя ставка
      baseCost,
      creatorBonus,
      authorBonus: 0,
      loanReceived: 0, // пока не реализуем ссуды
      finalShare,
      sharePercent: 0, // будет рассчитано позже от общего объема
      isCalculated: true,
      isDistributed: false,
      calculationDetails: {
        commitsCount: stats.commits.length,
        averageHourRate: stats.totalCost / stats.totalHours,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async calculateAuthorShare(
    projectId: string,
    authorId: string,
    authorSharePercent: number,
    creatorStats: Map<string, any>
  ): Promise<ResultShareDomainEntity> {
    // ЗАГЛУШКА МАТЕМАТИЧЕСКОГО ЯДРА
    // По ТЗ: доля автора = 61.8% от стоимости всего вложенного времени создателей

    let totalCreatorCost = 0;
    for (const [, stats] of creatorStats.entries()) {
      totalCreatorCost += stats.totalCost;
    }

    const authorBasePortion = totalCreatorCost * 0.618; // 61.8%
    const authorShare = authorBasePortion * (authorSharePercent / 100); // доля конкретного автора
    const authorBonus = authorShare; // 100% премия автору

    return {
      id: `share_${Date.now()}_${authorId}`,
      projectId,
      contributorId: authorId,
      type: ShareType.AUTHOR,
      timeSpent: 0, // авторы не тратят время на выполнение
      hourRate: 0,
      baseCost: authorShare,
      creatorBonus: 0,
      authorBonus,
      loanReceived: 0,
      finalShare: authorShare + authorBonus,
      sharePercent: authorSharePercent,
      isCalculated: true,
      isDistributed: false,
      calculationDetails: {
        totalCreatorCost,
        authorBasePortion,
        authorSharePercent,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async calculateCoordinatorShare(projectId: string, coordinatorId: string): Promise<ResultShareDomainEntity> {
    // ЗАГЛУШКА МАТЕМАТИЧЕСКОГО ЯДРА
    // По ТЗ: координатор получает 4% от общей суммы

    return {
      id: `share_${Date.now()}_${coordinatorId}`,
      projectId,
      contributorId: coordinatorId,
      type: ShareType.COORDINATOR,
      timeSpent: 0,
      hourRate: 0,
      baseCost: 0, // будет рассчитано после получения общих инвестиций
      creatorBonus: 0,
      authorBonus: 0,
      loanReceived: 0,
      finalShare: 0, // 4% от общих инвестиций
      sharePercent: 4,
      isCalculated: true,
      isDistributed: false,
      calculationDetails: {
        coordinatorPercent: 4,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async distributeShares(projectId: string): Promise<void> {
    const shares = await this.resultShareRepository.findByProjectId(projectId);

    for (const share of shares) {
      await this.resultShareRepository.update(share.id, {
        isDistributed: true,
        distributedAt: new Date(),
      });
    }
  }
}
