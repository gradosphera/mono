import { Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@ObjectType('AgreementVar')
export class AgreementVarDTO {
  @Field(() => String)
  @IsString()
  protocol_number!: string;

  @Field(() => String)
  @IsString()
  protocol_day_month_year!: string;
}
