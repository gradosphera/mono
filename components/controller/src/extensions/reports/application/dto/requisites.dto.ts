import { ObjectType, Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, IsIn, Matches } from 'class-validator';
import { ReportType } from '../../domain/enums/report-type.enum';

export enum RequisiteSource {
  DATABASE = 'database',
  MANUAL = 'manual',
  EMPTY = 'empty',
}

registerEnumType(RequisiteSource, { name: 'RequisiteSource' });

@ObjectType('RequisiteFieldView')
export class RequisiteFieldViewDTO {
  @Field(() => String, { nullable: true })
  value?: string | null;

  @Field(() => RequisiteSource)
  source!: RequisiteSource;
}

@ObjectType('ReportRequisitesView')
export class ReportRequisitesViewDTO {
  @Field(() => String)
  coopname!: string;

  // Поля из БД кооператива (source: 'database').
  @Field(() => RequisiteFieldViewDTO) inn!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) kpp!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) ogrn!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) orgName!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) address!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) phone!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) signerLastName!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) signerFirstName!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) signerMiddleName!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) chairmanPositionFromOrg!: RequisiteFieldViewDTO;

  // Ручные поля (source: 'manual').
  @Field(() => RequisiteFieldViewDTO) okved!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) okfs!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) okopf!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) oktmo!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) okpo!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) sfrRegNumber!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) chairmanPosition!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) signerSnils!: RequisiteFieldViewDTO;
  @Field(() => RequisiteFieldViewDTO) signerRepDoc!: RequisiteFieldViewDTO;

  // Выбор пользователя — не RequisiteField (не связан с БД-источником).
  // Default 'chairman' проставляется сервисом, если председатель не сохранял.
  @Field(() => String, {
    description: 'Тип подписанта: "chairman" (ПрПодп=1) или "representative" (ПрПодп=2)',
  })
  signerType!: 'chairman' | 'representative';
}

@InputType('UpdateReportRequisitesInput')
export class UpdateReportRequisitesInputDTO {
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() okved?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() okfs?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() okopf?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() oktmo?: string | null;
  // ОКПО: XSD ФНС требует ровно 10 цифр (pattern [0-9]{10}).
  // По ГОСТу допустимо 8 или 10 — оба принимаются, при необходимости
  // генератор дополнит до 10. Без паттерна сохранялись невалидные значения
  // (любая длина) и ломали XSD при выгрузке отчётов.
  @Field(() => String, { nullable: true, description: 'ОКПО — 8 или 10 цифр' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}(\d{2})?$/, { message: 'ОКПО — 8 или 10 цифр' })
  okpo?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() sfrRegNumber?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() chairmanPosition?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() signerSnils?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() signerRepDoc?: string | null;
  @Field(() => String, { nullable: true, description: 'chairman | representative' })
  @IsOptional()
  @IsIn(['chairman', 'representative'])
  signerType?: 'chairman' | 'representative' | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() phoneOverride?: string | null;
  @Field(() => String, { nullable: true }) @IsOptional() @IsString() addressOverride?: string | null;
}

@ObjectType('MissingRequisiteField')
export class MissingRequisiteFieldDTO {
  @Field(() => String) key!: string;
  @Field(() => String) label!: string;
  @Field(() => String) reason!: string;
  @Field(() => RequisiteSource) source!: RequisiteSource;
}

@ObjectType('ReportReadinessView')
export class ReportReadinessViewDTO {
  @Field(() => ReportType) reportType!: ReportType;
  @Field(() => Boolean) ready!: boolean;
  @Field(() => [MissingRequisiteFieldDTO]) missingFields!: MissingRequisiteFieldDTO[];
}
