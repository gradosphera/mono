import { Resolver, Query } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '~/modules/auth/decorators/current-user.decorator';
import type { MonoAccountDomainInterface } from '~/domain/account/interfaces/mono-account-domain.interface';
import { CoopgramApplicationService } from '../services/coopgram-application.service';
import { IframeTokenResponseDTO } from '../dto/get-iframe-token.dto';

@Resolver('matrix')
export class CoopgramResolver {
  constructor(private readonly coopgramAppService: CoopgramApplicationService) {}

  @Query(() => IframeTokenResponseDTO, {
    name: 'getToken',
    description: 'Получить токен для входа в Matrix через iframe',
  })
  @UseGuards(GqlJwtAuthGuard)
  async getMatrixToken(@CurrentUser() currentUser: MonoAccountDomainInterface): Promise<IframeTokenResponseDTO> {
    return this.coopgramAppService.getIframeToken(currentUser.username);
  }
}
