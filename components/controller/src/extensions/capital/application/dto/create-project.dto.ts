import { Field, ObjectType, InputType, Float, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class AuthorShareInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  contributorId!: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  @Max(100)
  sharePercent!: number;
}

@InputType()
export class CreateProjectRequestInputDTO {
  @Field(() => ID)
  @IsNotEmpty()
  @IsString()
  cycleId!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @Field(() => [AuthorShareInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorShareInput)
  authors!: AuthorShareInput[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  masterId?: string;
}

@ObjectType()
export class ProjectResponseDTO {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  cycleId!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  status!: string;

  @Field(() => [AuthorShareResponse])
  authors!: AuthorShareResponse[];

  @Field(() => ID, { nullable: true })
  masterId?: string;

  @Field(() => Float)
  plannedHours!: number;

  @Field(() => Float)
  actualHours!: number;

  @Field(() => Float)
  totalInvestment!: number;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class AuthorShareResponse {
  @Field(() => ID)
  contributorId!: string;

  @Field(() => Float)
  sharePercent!: number;
}
