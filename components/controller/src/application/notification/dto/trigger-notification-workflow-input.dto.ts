import { Field, InputType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType('NotificationWorkflowRecipientInput')
export class NotificationWorkflowRecipientInputDTO {
  @Field(() => String, {
    description: 'Username получателя',
  })
  @IsNotEmpty()
  @IsString()
  username!: string;
}

@InputType('TriggerNotificationWorkflowInput')
export class TriggerNotificationWorkflowInputDTO {
  @Field(() => String, {
    description: 'Имя воркфлоу для запуска',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Field(() => [NotificationWorkflowRecipientInputDTO], {
    description: 'Получатели уведомления',
  })
  @ValidateNested({ each: true })
  @Type(() => NotificationWorkflowRecipientInputDTO)
  to!: NotificationWorkflowRecipientInputDTO[];

  @Field(() => GraphQLJSONObject, {
    description: 'Данные для шаблона уведомления',
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
