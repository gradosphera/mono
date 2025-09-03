import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType('AgreementInput')
export class AgreementInputDTO {
  @Field(() => String)
  @IsString()
  protocol_number!: string;

  @Field(() => String)
  @IsString()
  protocol_day_month_year!: string;
}
