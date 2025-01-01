import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType('RefreshInput')
export class RefreshInputDTO {
  @Field({ description: 'Токен обновления' })
  @IsNotEmpty({ message: 'Поле "refresh_token" обязательно для заполнения.' })
  refresh_token!: string;

  @Field({ description: 'Токен доступа' })
  @IsNotEmpty({ message: 'Поле "access_token" обязательно для заполнения.' })
  access_token!: string;
}
