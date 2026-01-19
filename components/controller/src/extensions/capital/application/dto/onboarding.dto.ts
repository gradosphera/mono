import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum CapitalOnboardingStepEnum {
  generation_agreement_template = 'generation_agreement_template',
  blagorost_provision = 'blagorost_provision',
  blagorost_offer_template = 'blagorost_offer_template',
}

registerEnumType(CapitalOnboardingStepEnum, {
  name: 'CapitalOnboardingStep',
});

@InputType('CapitalOnboardingStepInput')
export class CapitalOnboardingStepInputDTO {
  @Field(() => CapitalOnboardingStepEnum)
  @IsEnum(CapitalOnboardingStepEnum)
  step!: CapitalOnboardingStepEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  question!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  decision!: string;
}

@ObjectType('CapitalOnboardingState')
export class CapitalOnboardingStateDTO {
  @Field(() => Boolean)
  generation_agreement_template_done!: boolean;

  @Field(() => String, { nullable: true })
  onboarding_generation_agreement_template_hash?: string | null;

  @Field(() => Boolean)
  blagorost_provision_done!: boolean;

  @Field(() => String, { nullable: true })
  onboarding_blagorost_provision_hash?: string | null;

  @Field(() => Boolean)
  blagorost_offer_template_done!: boolean;

  @Field(() => String, { nullable: true })
  onboarding_blagorost_offer_template_hash?: string | null;

  @Field(() => String)
  onboarding_init_at!: string;

  @Field(() => String)
  onboarding_expire_at!: string;
}
