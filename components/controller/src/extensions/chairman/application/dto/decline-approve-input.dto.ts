import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

/**
 * GraphQL Input DTO для мутации отклонения одобрения
 */
@InputType('DeclineApproveInput', {
  description: 'Входные данные для отклонения одобрения документа',
})
export class DeclineApproveInputDTO {
  @Field(() => String, {
    description: 'Название кооператива',
  })
  @IsString()
  @IsNotEmpty()
  coopname!: string;

  @Field(() => String, {
    description: 'Хеш одобрения для идентификации',
  })
  @IsString()
  @IsNotEmpty()
  approval_hash!: string;

  @Field(() => String, {
    description: 'Причина отклонения',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
