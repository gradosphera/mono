import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ProgramType } from '~/domain/wallet/enums/program-type.enum';

// Регистрируем enum для GraphQL
registerEnumType(ProgramType, {
  name: 'ProgramType',
  description: 'Тип целевой потребительской программы',
});

/**
 * DTO для фильтрации программных кошельков
 */
@InputType('ProgramWalletFilterInput')
export class ProgramWalletFilterInputDTO {
  @Field(() => String, { nullable: true, description: 'Фильтр по имени пользователя' })
  @IsOptional()
  @IsString()
  username?: string;

  @Field(() => String, { nullable: true, description: 'Фильтр по ID программы' })
  @IsOptional()
  @IsString()
  program_id?: string;

  @Field(() => ProgramType, { nullable: true, description: 'Фильтр по типу программы' })
  @IsOptional()
  @IsEnum(ProgramType)
  program_type?: ProgramType;

  @Field(() => String, { nullable: true, description: 'Фильтр по имени кооператива' })
  @IsOptional()
  @IsString()
  coopname?: string;
}
