import { Field, ObjectType, InputType, Float, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsUrl } from 'class-validator';

@InputType()
export class CreateCommitRequestInputDTO {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  assignmentId!: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  creatorId!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.1)
  hoursSpent!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  externalRepoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  externalDbReference?: string;
}

@InputType()
export class ReviewCommitRequestInputDTO {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  commitId!: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  masterId!: string;

  @Field()
  isAccepted!: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
}

@ObjectType()
export class CommitResponseDTO {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  assignmentId!: string;

  @Field(() => ID)
  creatorId!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => Float)
  hoursSpent!: number;

  @Field(() => Float)
  hourRate!: number;

  @Field(() => Float)
  totalCost!: number;

  @Field()
  status!: string;

  @Field(() => ID, { nullable: true })
  reviewedBy?: string;

  @Field({ nullable: true })
  reviewComment?: string;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field()
  createdAt!: Date;
}
