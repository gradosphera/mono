import { InputType, Field } from '@nestjs/graphql';
import { AccountType } from '../enum/account-type.enum';
import { RegisterRole } from '../enum/account-role-on-register.enum';
import { IsNotEmpty, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateEntrepreneurDataInputDTO } from './update-entrepreneur-data-input.dto';
import { UpdateIndividualDataInputDTO } from './update-individual-data-input.dto';
import { UpdateOrganizationDataInputDTO } from './update-organization-data-input.dto';

@InputType('UpdateAccountInput')
export class UpdateAccountInputDTO {
  @Field({ description: 'Электронная почта' })
  @IsNotEmpty({ message: 'Поле "email" обязательно для заполнения.' })
  email!: string;

  @Field({ nullable: true, description: 'Имя аккаунта реферера' })
  @IsOptional()
  referer?: string;

  @Field(() => RegisterRole, { description: 'Роль пользователя' })
  @IsNotEmpty({ message: 'Поле "role" обязательно для заполнения.' })
  role!: RegisterRole;

  @Field(() => AccountType, { description: 'Тип аккаунта' })
  @IsNotEmpty({ message: 'Поле "type" обязательно для заполнения.' })
  type!: AccountType;

  @Field({ description: 'Имя пользователя' })
  @IsNotEmpty({ message: 'Поле "username" обязательно для заполнения.' })
  username!: string;

  @Field({ nullable: true, description: 'Публичный ключ' })
  @IsOptional()
  public_key?: string;

  @Field(() => UpdateEntrepreneurDataInputDTO, { nullable: true, description: 'Данные индивидуального предпринимателя' })
  @ValidateNested()
  @Type(() => UpdateEntrepreneurDataInputDTO)
  @IsOptional()
  entrepreneur_data?: UpdateEntrepreneurDataInputDTO;

  @Field(() => UpdateIndividualDataInputDTO, { nullable: true, description: 'Данные физического лица' })
  @ValidateNested()
  @Type(() => UpdateIndividualDataInputDTO)
  @IsOptional()
  individual_data?: UpdateIndividualDataInputDTO;

  @Field(() => UpdateOrganizationDataInputDTO, { nullable: true, description: 'Данные организации' })
  @ValidateNested()
  @Type(() => UpdateOrganizationDataInputDTO)
  @IsOptional()
  organization_data?: UpdateOrganizationDataInputDTO;

  @ValidateIf((o: UpdateAccountInputDTO) => !o.entrepreneur_data && !o.individual_data && !o.organization_data)
  @IsNotEmpty({
    message: 'Необходимо указать хотя бы одно из полей: "entrepreneur_data", "individual_data" или "organization_data".',
  })
  validateOneTypePresent!: boolean;
}
