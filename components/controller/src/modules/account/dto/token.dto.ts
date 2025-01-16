import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('Token')
export class TokenDTO {
  @Field({ description: 'Токен доступа' })
  token!: string;

  @Field(() => Date, { description: 'Дата истечения токена доступа' })
  expires!: Date;
}
