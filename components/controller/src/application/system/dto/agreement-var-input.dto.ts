import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType('AgreementVarInput')
export class AgreementVarInputDTO {
  @Field(() => String)
  @IsString()
  protocol_number!: string;

  @Field(() => String)
  @IsString()
  protocol_day_month_year!: string;
}
