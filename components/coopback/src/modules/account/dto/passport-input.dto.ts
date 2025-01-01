import { InputType, Field } from '@nestjs/graphql';

@InputType('PassportInput')
export class PassportInputDTO {
  @Field()
  code!: string;

  @Field()
  issued_at!: string;

  @Field()
  issued_by!: string;

  @Field()
  number!: number;

  @Field()
  series!: number;
}
