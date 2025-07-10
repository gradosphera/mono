import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import type {
  CreateSubscriptionInputDomainInterface,
  WebPushSubscriptionDataDomainInterface,
} from '~/domain/notification/interfaces/web-push-subscription-domain.interface';

@InputType('WebPushSubscriptionKeys')
export class WebPushSubscriptionKeysDTO {
  @Field(() => String, { description: 'P256DH ключ для веб-пуш подписки' })
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @Field(() => String, { description: 'Auth ключ для веб-пуш подписки' })
  @IsString()
  @IsNotEmpty()
  auth!: string;
}

@InputType('WebPushSubscriptionData')
export class WebPushSubscriptionDataDTO implements WebPushSubscriptionDataDomainInterface {
  @Field(() => String, { description: 'Endpoint для веб-пуш подписки' })
  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @Field(() => WebPushSubscriptionKeysDTO, { description: 'Ключи для веб-пуш подписки' })
  @ValidateNested()
  @Type(() => WebPushSubscriptionKeysDTO)
  keys!: WebPushSubscriptionKeysDTO;
}

@InputType('CreateWebPushSubscriptionInput')
export class CreateWebPushSubscriptionInputDTO implements CreateSubscriptionInputDomainInterface {
  @Field(() => String, { description: 'ID пользователя' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @Field(() => WebPushSubscriptionDataDTO, { description: 'Данные веб-пуш подписки' })
  @ValidateNested()
  @Type(() => WebPushSubscriptionDataDTO)
  subscription!: WebPushSubscriptionDataDTO;

  @Field(() => String, { description: 'User Agent браузера', nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
