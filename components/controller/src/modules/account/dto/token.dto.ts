import { ObjectType, Field } from '@nestjs/graphql';
import { DateResolver } from 'graphql-scalars';

@ObjectType('Token')
export class TokenDTO {
  @Field({ description: 'Токен доступа' })
  token!: string;

  @Field(() => DateResolver, { description: 'Дата истечения токена доступа' })
  expires!: Date;
}
