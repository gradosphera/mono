import { Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType('GetDocumentsInput')
export class GetDocumentsInputDTO {
  @Field(() => String)
  username!: string;

  @Field(() => GraphQLJSON)
  filter!: Record<string, unknown>;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => String, { nullable: true })
  type?: 'newsubmitted' | 'newresolved';
}
