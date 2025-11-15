import { Field, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AgreementVarDTO } from './agreement-vars.dto';

@ObjectType('Vars')
export class VarsDTO {
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

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  statute_link?: string | null;

  @Field(() => String)
  passport_request!: 'yes' | 'no';

  @Field(() => AgreementVarDTO)
  @Type(() => AgreementVarDTO)
  wallet_agreement!: AgreementVarDTO;

  @Field(() => AgreementVarDTO)
  @Type(() => AgreementVarDTO)
  privacy_agreement!: AgreementVarDTO;

  @Field(() => AgreementVarDTO)
  @Type(() => AgreementVarDTO)
  signature_agreement!: AgreementVarDTO;

  @Field(() => AgreementVarDTO)
  @Type(() => AgreementVarDTO)
  user_agreement!: AgreementVarDTO;

  @Field(() => AgreementVarDTO)
  @Type(() => AgreementVarDTO)
  participant_application!: AgreementVarDTO;

  @Field(() => AgreementVarDTO, { nullable: true })
  @IsOptional()
  @Type(() => AgreementVarDTO)
  coopenomics_agreement?: AgreementVarDTO | null;
}
