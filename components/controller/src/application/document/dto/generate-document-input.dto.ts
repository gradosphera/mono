import { InputType, OmitType } from '@nestjs/graphql';
import { GenerateMetaDocumentInputDTO } from './generate-meta-document-input.dto';

@InputType(`GenerateDocumentInput`)
export class GenerateDocumentInputDTO extends OmitType(GenerateMetaDocumentInputDTO, ['registry_id'] as const) {
  registry_id!: number;

  constructor() {
    super();
  }
}
