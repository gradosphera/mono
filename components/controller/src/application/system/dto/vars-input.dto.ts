import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, ValidateNested, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { AgreementInputDTO } from './agreement-input.dto';

@InputType('VarsInput')
export class VarsInputDTO {
  @Field(() => String)
  @IsString()
  coopname!: string;

  @Field(() => String)
  @IsString()
  full_abbr!: string;

  @Field(() => String)
  @IsString()
  full_abbr_genitive!: string;

  @Field(() => String)
  @IsString()
  full_abbr_dative!: string;

  @Field(() => String)
  @IsString()
  short_abbr!: string;

  @Field(() => String)
  @IsString()
  website!: string;

  @Field(() => String)
  @IsString()
  name!: string;

  @Field(() => String)
  @IsString()
  confidential_link!: string;

  @Field(() => String)
  @IsString()
  confidential_email!: string;

  @Field(() => String)
  @IsString()
  contact_email!: string;

  @Field(() => String)
  @IsIn(['yes', 'no'], { message: 'passport_request must be either "yes" or "no"' })
  passport_request!: 'yes' | 'no';

  @Field(() => AgreementInputDTO)
  @ValidateNested()
  @Type(() => AgreementInputDTO)
  wallet_agreement!: AgreementInputDTO;

  @Field(() => AgreementInputDTO)
  @ValidateNested()
  @Type(() => AgreementInputDTO)
  privacy_agreement!: AgreementInputDTO;

  @Field(() => AgreementInputDTO)
  @ValidateNested()
  @Type(() => AgreementInputDTO)
  signature_agreement!: AgreementInputDTO;

  @Field(() => AgreementInputDTO)
  @ValidateNested()
  @Type(() => AgreementInputDTO)
  user_agreement!: AgreementInputDTO;

  @Field(() => AgreementInputDTO)
  @ValidateNested()
  @Type(() => AgreementInputDTO)
  participant_application!: AgreementInputDTO;

  @Field(() => AgreementInputDTO, { nullable: true })
  @ValidateNested()
  @IsOptional()
  @Type(() => AgreementInputDTO)
  coopenomics_agreement?: AgreementInputDTO;

  // Нужно для совместимости типов с vars в generator. Удалить потом т.к. никак не используется.
  [key: string]: unknown; // Добавлено индексное сигнатурное свойство
}
