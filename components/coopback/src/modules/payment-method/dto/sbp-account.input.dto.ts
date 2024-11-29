// payment-method-data.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType('SbpDataInput')
export class SBPDataInputDTO {
  @Field(() => String, { description: 'Мобильный телефон получателя' })
  @IsNotEmpty({ message: 'Телефон обязателен для метода СБП' })
  @IsString()
  phone!: string;
}
