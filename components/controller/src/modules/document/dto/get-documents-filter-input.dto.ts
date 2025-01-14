import { InputType, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType('GetDocumentsFilterInput')
export class GetDocumentsFilterInputDTO {
  @Field(() => String)
  receiver!: string;

  @Field(() => GraphQLJSON, { nullable: true }) // Используйте JSON тип для динамических свойств
  additionalFilters?: Record<string, unknown>;
}
