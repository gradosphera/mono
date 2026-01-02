import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { Throttle } from '@nestjs/throttler';
import { RegistrationService } from '../services/registration.service';
import { GenerateRegistrationDocumentsInputDTO } from '../dto/generate-registration-documents-input.dto';
import { GenerateRegistrationDocumentsOutputDTO } from '../dto/generate-registration-documents-output.dto';

@Resolver()
export class RegistrationResolver {
  constructor(private readonly registrationService: RegistrationService) {}

  @Mutation(() => GenerateRegistrationDocumentsOutputDTO, {
    name: 'generateRegistrationDocuments',
    description:
      'Генерирует пакет документов для регистрации пайщика. Возвращает список документов с метаданными для отображения на фронтенде.',
  })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async generateRegistrationDocuments(
    @Args('data', { type: () => GenerateRegistrationDocumentsInputDTO })
    data: GenerateRegistrationDocumentsInputDTO
  ): Promise<GenerateRegistrationDocumentsOutputDTO> {
    return this.registrationService.generateRegistrationDocuments(data);
  }
}
