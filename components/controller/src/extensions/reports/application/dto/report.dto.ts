import { ObjectType, Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';
import { ReportType, ReportPeriodType } from '../../domain/enums/report-type.enum';

registerEnumType(ReportType, { name: 'ReportType' });
registerEnumType(ReportPeriodType, { name: 'ReportPeriodType' });

@ObjectType('AvailableReport')
export class AvailableReportDTO {
  @Field(() => ReportType)
  type!: ReportType;

  @Field(() => String)
  name!: string;

  @Field(() => String)
  period!: string;

  @Field(() => String)
  deadline!: string;
}

@InputType('GenerateReportInput')
export class GenerateReportInputDTO {
  @Field(() => ReportType)
  @IsEnum(ReportType)
  reportType!: ReportType;

  @Field(() => Int)
  @IsInt()
  year!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  period?: number;
}

@ObjectType('GeneratedReport')
export class GeneratedReportDTO {
  @Field(() => ReportType)
  reportType!: ReportType;

  @Field(() => String)
  xml!: string;

  @Field(() => String)
  fileName!: string;

  @Field(() => [String])
  errors!: string[];

  @Field(() => Boolean)
  isValid!: boolean;
}
