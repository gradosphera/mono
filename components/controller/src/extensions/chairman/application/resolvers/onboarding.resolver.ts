import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import {
  ChairmanOnboardingAgendaInputDTO,
  ChairmanOnboardingGeneralMeetInputDTO,
  ChairmanOnboardingStateDTO,
} from '../dto/onboarding.dto';
import { ChairmanOnboardingService } from '../services/onboarding.service';
import { CurrentUser } from '~/application/auth/decorators/current-user.decorator';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';

@Resolver()
export class ChairmanOnboardingResolver {
  constructor(private readonly onboardingService: ChairmanOnboardingService) {}

  @Query(() => ChairmanOnboardingStateDTO, {
    name: 'getChairmanOnboardingState',
    description: 'Получить состояние онбординга председателя',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async getState(): Promise<ChairmanOnboardingStateDTO> {
    return this.onboardingService.getState();
  }

  @Mutation(() => ChairmanOnboardingStateDTO, {
    name: 'completeChairmanAgendaStep',
    description: 'Выполнить один из шагов онбординга (создание предложения повестки)',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async completeAgendaStep(
    @Args('data', { type: () => ChairmanOnboardingAgendaInputDTO }) data: ChairmanOnboardingAgendaInputDTO,
    @CurrentUser() currentUser: MonoAccountDomainInterface
  ): Promise<ChairmanOnboardingStateDTO> {
    // Используем текущего пользователя как инициатора повестки
    return this.onboardingService.completeAgendaStep(data, currentUser?.username);
  }

  @Mutation(() => ChairmanOnboardingStateDTO, {
    name: 'completeChairmanGeneralMeetStep',
    description: 'Выполнить шаг онбординга по созданию общего собрания (сохранить hash повестки)',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async completeGeneralMeetStep(
    @Args('data', { type: () => ChairmanOnboardingGeneralMeetInputDTO }) data: ChairmanOnboardingGeneralMeetInputDTO,
    @CurrentUser() currentUser: MonoAccountDomainInterface
  ): Promise<ChairmanOnboardingStateDTO> {
    return this.onboardingService.completeGeneralMeet(data.proposal_hash, currentUser?.username);
  }
}
