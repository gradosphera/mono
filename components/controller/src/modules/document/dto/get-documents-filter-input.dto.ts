import { InputType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType('GetDocumentsFilterInput')
export class GetDocumentsFilterInputDTO {
  @Field(() => GraphQLJSON, { nullable: true })
  additionalFilters?: Record<string, unknown>;
}
