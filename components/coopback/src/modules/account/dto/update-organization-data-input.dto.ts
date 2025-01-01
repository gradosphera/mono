import { InputType, Field } from '@nestjs/graphql';
import { ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { OrganizationType } from '../enum/organization-type.enum';
import { OrganizationDetailsInputDTO } from './organization-details-input.dto';
import { RepresentedByInputDTO } from './represented-by-input.dto';

@InputType('UpdateOrganizationDataInput')
export class UpdateOrganizationDataInputDTO {
  @Field({ description: 'Город' })
  @IsNotEmpty({ message: 'Поле "city" обязательно для заполнения.' })
  city!: string;

  @Field({ description: 'Страна' })
  @IsNotEmpty({ message: 'Поле "country" обязательно для заполнения.' })
  country!: string;

  @Field(() => OrganizationDetailsInputDTO, { description: 'Детали организации' })
  @ValidateNested()
  @Type(() => OrganizationDetailsInputDTO)
  @IsNotEmpty({ message: 'Поле "details" обязательно для заполнения.' })
  details!: OrganizationDetailsInputDTO;

  //поле не принимаем - устанавливаем автоматически
  email!: string;

  @Field({ description: 'Фактический адрес' })
  @IsNotEmpty({ message: 'Поле "fact_address" обязательно для заполнения.' })
  fact_address!: string;

  @Field({ description: 'Полный адрес' })
  @IsNotEmpty({ message: 'Поле "full_address" обязательно для заполнения.' })
  full_address!: string;

  @Field({ description: 'Полное наименование организации' })
  @IsNotEmpty({ message: 'Поле "full_name" обязательно для заполнения.' })
  full_name!: string;

  @Field({ description: 'Телефон' })
  @IsNotEmpty({ message: 'Поле "phone" обязательно для заполнения.' })
  phone!: string;

  @Field(() => RepresentedByInputDTO, { description: 'Представитель организации' })
  @ValidateNested()
  @Type(() => RepresentedByInputDTO)
  @IsNotEmpty({ message: 'Поле "represented_by" обязательно для заполнения.' })
  represented_by!: RepresentedByInputDTO;

  @Field({ description: 'Краткое наименование организации' })
  @IsNotEmpty({ message: 'Поле "short_name" обязательно для заполнения.' })
  short_name!: string;

  @Field(() => OrganizationType, { description: 'Тип организации' })
  @IsNotEmpty({ message: 'Поле "type" обязательно для заполнения.' })
  type!: OrganizationType;
}
