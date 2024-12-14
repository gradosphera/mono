import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, IsBoolean } from 'class-validator';

@ObjectType('Verification')
export class VerificationDTO {
  @Field(() => String, { description: 'Имя верификатора' })
  @IsString()
  public readonly verificator!: string;

  @Field(() => Boolean, { description: 'Флаг верификации' })
  @IsBoolean()
  public readonly is_verified!: boolean;

  @Field(() => String, { description: 'Процедура верификации' })
  @IsString()
  public readonly procedure!: string;

  @Field(() => String, { description: 'Дата создания верификации' })
  @IsString()
  public readonly created_at!: string;

  @Field(() => String, { description: 'Дата последнего обновления верификации' })
  @IsString()
  public readonly last_update!: string;

  @Field(() => String, { description: 'Заметка верификации' })
  @IsString()
  public readonly notice!: string;

  constructor(data: VerificationDTO | null) {
    Object.assign(this, data);
  }
}
