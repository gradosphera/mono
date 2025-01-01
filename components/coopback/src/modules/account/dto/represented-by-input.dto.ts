import { InputType, Field } from '@nestjs/graphql';

@InputType('RepresentedByInput')
export class RepresentedByInputDTO {
  @Field()
  based_on!: string;

  @Field()
  first_name!: string;

  @Field()
  last_name!: string;

  @Field()
  middle_name!: string;

  @Field()
  position!: string;
}
