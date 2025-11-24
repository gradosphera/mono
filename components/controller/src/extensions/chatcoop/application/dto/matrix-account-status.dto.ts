import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MatrixAccountStatusResponseDTO {
  @Field()
  hasAccount!: boolean;

  @Field({ nullable: true })
  matrixUsername?: string;

  @Field({ nullable: true })
  iframeUrl?: string;
}
