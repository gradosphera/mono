import { Field, InputType } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType('CreateChildOrderInput')
export class CreateChildOrderInputDTO {
  @Field(() => Object, { description: 'Параметры заявки' })
  @ValidateNested()
  @Type(() => Object)
  params!: any;
}
