import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ChatCoopTokenResponseDTO {
  @Field()
  iframeUrl!: string;

  @Field()
  expiresAt!: Date;
}
