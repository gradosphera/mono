import { Field, InputType, Int } from '@nestjs/graphql';
import { GetDocumentsFilterInputDTO } from './get-documents-filter-input.dto';

@InputType('GetDocumentsInput')
export class GetDocumentsInputDTO {
  @Field(() => GetDocumentsFilterInputDTO)
  filter!: GetDocumentsFilterInputDTO;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => String, { nullable: true })
  type?: 'newsubmitted' | 'newresolved';
}
