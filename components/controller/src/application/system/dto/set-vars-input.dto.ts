import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AgreementVarInputDTO } from './agreement-var-input.dto';

@InputType('SetVarsInput')
export class SetVarsInputDTO {
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
  passport_request!: 'yes' | 'no';

  @Field(() => AgreementVarInputDTO)
  @Type(() => AgreementVarInputDTO)
  @ValidateNested()
  wallet_agreement!: AgreementVarInputDTO;

  @Field(() => AgreementVarInputDTO)
  @Type(() => AgreementVarInputDTO)
  @ValidateNested()
  privacy_agreement!: AgreementVarInputDTO;

  @Field(() => AgreementVarInputDTO)
  @Type(() => AgreementVarInputDTO)
  @ValidateNested()
  signature_agreement!: AgreementVarInputDTO;

  @Field(() => AgreementVarInputDTO)
  @Type(() => AgreementVarInputDTO)
  @ValidateNested()
  user_agreement!: AgreementVarInputDTO;

  @Field(() => AgreementVarInputDTO)
  @Type(() => AgreementVarInputDTO)
  @ValidateNested()
  participant_application!: AgreementVarInputDTO;

  @Field(() => AgreementVarInputDTO, { nullable: true })
  @IsOptional()
  @Type(() => AgreementVarInputDTO)
  @ValidateNested()
  coopenomics_agreement?: AgreementVarInputDTO | null;
}
