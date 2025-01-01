import { InputType, Field } from '@nestjs/graphql';

@InputType('EntrepreneurDetailsInput')
export class EntrepreneurDetailsInputDTO {
  @Field(() => String, { description: 'ИНН' })
  inn!: string;

  @Field(() => String, { description: 'ОГРН' })
  ogrn!: string;
}
