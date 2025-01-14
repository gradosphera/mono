import { InputType, Field } from '@nestjs/graphql';
import { AccountType } from '../enum/account-type.enum';
import { RegisterRole } from '../enum/account-role-on-register.enum';
import { CreateEntrepreneurDataInputDTO } from './create-entrepreneur-data-input.dto';
import { CreateIndividualDataInputDTO } from './create-individual-data-input.dto';
import { CreateOrganizationDataInputDTO } from './create-organization-data-input.dto';
import { IsNotEmpty, IsOptional, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType('RegisterAccountInput')
export class RegisterAccountInputDTO {
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

  @Field(() => CreateEntrepreneurDataInputDTO, { nullable: true, description: 'Данные индивидуального предпринимателя' })
  @ValidateNested()
  @Type(() => CreateEntrepreneurDataInputDTO)
  @IsOptional()
  entrepreneur_data?: CreateEntrepreneurDataInputDTO;

  @Field(() => CreateIndividualDataInputDTO, { nullable: true, description: 'Данные физического лица' })
  @ValidateNested()
  @Type(() => CreateIndividualDataInputDTO)
  @IsOptional()
  individual_data?: CreateIndividualDataInputDTO;

  @Field(() => CreateOrganizationDataInputDTO, { nullable: true, description: 'Данные организации' })
  @ValidateNested()
  @Type(() => CreateOrganizationDataInputDTO)
  @IsOptional()
  organization_data?: CreateOrganizationDataInputDTO;

  @ValidateIf((o: RegisterAccountInputDTO) => !o.entrepreneur_data && !o.individual_data && !o.organization_data)
  @IsNotEmpty({
    message: 'Необходимо указать хотя бы одно из полей: "entrepreneur_data", "individual_data" или "organization_data".',
  })
  validateOneTypePresent!: boolean;
}
