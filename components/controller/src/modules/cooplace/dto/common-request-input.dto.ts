import { Field, InputType, Int, Float } from '@nestjs/graphql';
import { IsInt, IsNumber, IsString } from 'class-validator';

@InputType('CommonRequestInput')
export class CommonRequestInputDTO {
  @Field()
  @IsString()
  hash!: string;

  @Field()
  @IsString()
  title!: string;

  @Field()
  @IsString()
  unit_of_measurement!: string;

  @Field(() => Int)
  @IsInt()
  units!: number;

  @Field(() => Float)
  @IsNumber()
  unit_cost!: number;

  @Field(() => Float)
  @IsNumber()
  total_cost!: number;

  @Field()
  @IsString()
  currency!: string;

  @Field()
  @IsString()
  type!: string;

  @Field(() => Int)
  @IsInt()
  program_id!: number;
}
