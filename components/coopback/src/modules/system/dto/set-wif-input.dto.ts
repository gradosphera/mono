import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType('SetWifInput')
export class SetWifInputDTO {
  @Field(() => String, { defaultValue: 'active', description: 'Тип разрешения ключа' })
  @IsOptional()
  @IsString()
  permission?: 'active';

  @Field(() => String, { description: 'Имя пользователя, чей ключ' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Приватный ключ' })
  @IsString()
  wif!: string;
}
