import { Field, ObjectType, InputType, Float, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class StoryInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  description!: string;
}

@InputType()
export class CreateAssignmentRequestInputDTO {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  projectId!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  masterId!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  estimatedHours!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  estimatedExpenses!: number;

  @Field(() => [StoryInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StoryInput)
  stories!: StoryInput[];
}

@ObjectType()
export class StoryResponse {
  @Field(() => ID)
  id!: string;

  @Field()
  description!: string;

  @Field()
  isCompleted!: boolean;

  @Field({ nullable: true })
  completedAt?: Date;
}

@ObjectType()
export class AssignmentResponseDTO {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  projectId!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  status!: string;

  @Field(() => ID)
  masterId!: string;

  @Field(() => [ID])
  assignedCreators!: string[];

  @Field(() => Float)
  estimatedHours!: number;

  @Field(() => Float)
  actualHours!: number;

  @Field(() => [StoryResponse])
  stories!: StoryResponse[];

  @Field()
  createdAt!: Date;
}
