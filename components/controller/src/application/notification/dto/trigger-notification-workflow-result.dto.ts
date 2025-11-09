import { Field, ObjectType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

@ObjectType('TriggerNotificationWorkflowResult')
export class TriggerNotificationWorkflowResultDTO {
  @Field(() => Boolean, {
    description: 'Статус подтверждения обработки',
  })
  @IsBoolean()
  acknowledged!: boolean;

  @Field(() => String, {
    description: 'Статус операции',
  })
  @IsEnum(['processed', 'warning', 'error'])
  status!: 'processed' | 'warning' | 'error';

  @Field(() => [String], {
    description: 'Список ошибок (если есть)',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  error?: string[];
}
