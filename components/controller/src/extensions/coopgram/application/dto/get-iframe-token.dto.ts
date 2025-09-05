import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class IframeTokenResponseDTO {
  @Field()
  token!: string;

  @Field()
  expiresAt!: Date;
}
