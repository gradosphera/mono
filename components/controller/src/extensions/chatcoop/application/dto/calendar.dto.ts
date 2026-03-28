import { Field, GraphQLISODateTime, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType('ChatCoopCalendarRoomOption')
export class ChatCoopCalendarRoomOptionDTO {
  @Field()
  matrixRoomId!: string;

  @Field()
  displayLabel!: string;
}

@ObjectType('ChatCoopCalendarEvent')
export class ChatCoopCalendarEventDTO {
  @Field()
  id!: string;

  @Field()
  matrixRoomId!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => GraphQLISODateTime)
  startsAt!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endsAt!: Date | null;

  @Field()
  createdByUsername!: string;

  @Field(() => Int)
  icsSequence!: number;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}

@ObjectType('ChatCoopCalendarIcsUrlResponse')
export class ChatCoopCalendarIcsUrlResponseDTO {
  @Field({ description: 'Полный URL ленты ICS с секретом в query (без JWT)' })
  icsUrl!: string;
}

@InputType('CreateChatCoopCalendarEventInput')
export class CreateChatCoopCalendarEventInputDTO {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  matrixRoomId!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string | null;

  @Field(() => GraphQLISODateTime)
  @Type(() => Date)
  startsAt!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  endsAt?: Date | null;
}

@InputType('UpdateChatCoopCalendarEventInput')
export class UpdateChatCoopCalendarEventInputDTO {
  @Field()
  @IsUUID('4')
  id!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  matrixRoomId!: string;

  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string | null;

  @Field(() => GraphQLISODateTime)
  @Type(() => Date)
  startsAt!: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  endsAt?: Date | null;
}
