import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

@InputType('DeletePaymentMethodInput')
export class DeletePaymentMethodDTO {
  @Field(() => String, { description: 'Имя пользователя, чей метод оплаты нужно удалить' })
  @IsNotEmpty()
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор метода оплаты' })
  @IsNotEmpty()
  @IsNumber()
  method_id!: string;
}
