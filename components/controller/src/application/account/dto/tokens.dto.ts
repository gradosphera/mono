import { ObjectType, Field } from '@nestjs/graphql';
import { TokenDTO } from './token.dto';

@ObjectType('Tokens')
export class TokensDTO {
  @Field(() => TokenDTO, { description: 'Токен доступа' })
  access!: TokenDTO;

  @Field(() => TokenDTO, { description: 'Токен обновления' })
  refresh!: TokenDTO;
}
