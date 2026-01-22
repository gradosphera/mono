import { Injectable, Inject } from '@nestjs/common';
import {
  REGISTRATION_DOCUMENTS_SERVICE,
  RegistrationDocumentsService,
} from '~/domain/registration/services/registration-documents.service';
import type { GenerateRegistrationDocumentsInputDTO } from '../dto/generate-registration-documents-input.dto';
import { GenerateRegistrationDocumentsOutputDTO } from '../dto/generate-registration-documents-output.dto';

@Injectable()
export class RegistrationService {
  constructor(
    @Inject(REGISTRATION_DOCUMENTS_SERVICE)
    private readonly registrationDocumentsService: RegistrationDocumentsService
  ) {}

  /**
   * Генерация пакета документов для регистрации
   */
  async generateRegistrationDocuments(
    data: GenerateRegistrationDocumentsInputDTO
  ): Promise<GenerateRegistrationDocumentsOutputDTO> {
    const result = await this.registrationDocumentsService.generateRegistrationDocuments(data);

    return new GenerateRegistrationDocumentsOutputDTO(result);
  }
}
