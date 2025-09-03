// modules/appstore/dto/extension-graphql-input.dto.ts
import { Field, InputType } from '@nestjs/graphql';

@InputType('GetBranchesInput')
export class GetBranchesGraphQLInput {
  @Field(() => String, { description: 'Имя аккаунта кооператива' })
  coopname!: string;

  @Field(() => String, { description: 'Фильтр по имени аккаунта кооперативного участка', nullable: true })
  braname!: string;
}
