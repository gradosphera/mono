import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

/**
 * Фильтр для программных кошельков
 */
@InputType('ProgramWalletFilter')
export class ProgramWalletFilterDTO {
  @Field(() => String, { nullable: true, description: 'Фильтр по имени пользователя' })
  @IsOptional()
  @IsString()
  username?: string;

  @Field(() => String, { nullable: true, description: 'Фильтр по ID программы' })
  @IsOptional()
  @IsString()
  program_id?: string;

  @Field(() => String, { nullable: true, description: 'Фильтр по имени кооператива' })
  @IsOptional()
  @IsString()
  coopname?: string;
}
