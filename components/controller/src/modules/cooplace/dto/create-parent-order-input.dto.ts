import { Field, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType('CreateParentOrderInput')
export class CreateParentOrderInputDTO {
  @Field({ description: 'Параметры заказа' })
  @ValidateNested()
  @Type(() => Object)
  params: any;
}
