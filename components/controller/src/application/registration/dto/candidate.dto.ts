import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CandidateStatus } from '~/domain/registration/enum';

registerEnumType(CandidateStatus, {
  name: 'CandidateStatus',
});

@ObjectType('Candidate')
export class CandidateOutputDTO {
  @Field(() => String)
  username!: string;

  @Field(() => String, { nullable: true })
  username_display_name?: string;

  @Field(() => String)
  coopname!: string;

  @Field(() => String, { nullable: true })
  braname?: string;

  @Field(() => CandidateStatus)
  status!: CandidateStatus;

  @Field(() => String)
  type!: string;

  @Field(() => Date)
  created_at!: Date;

  @Field(() => Date, { nullable: true })
  registered_at?: Date;

  @Field(() => String, { nullable: true })
  referer?: string;

  @Field(() => String, { nullable: true })
  referer_display_name?: string;

  @Field(() => String)
  public_key!: string;

  @Field(() => String, { nullable: true })
  program_key?: string;
}
