import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('PublicChairman')
export class PublicChairmanDTO {
  @Field(() => String)
  first_name!: string;

  @Field(() => String)
  last_name!: string;

  @Field(() => String)
  middle_name!: string;
}
