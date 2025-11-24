import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoopgramTokenResponseDTO {
  @Field()
  iframeUrl!: string;

  @Field()
  expiresAt!: Date;
}
