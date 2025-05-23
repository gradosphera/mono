import { ObjectType, Field } from '@nestjs/graphql';
import type { SovietContract } from 'cooptypes';
import { SignedBlockchainDocumentDTO } from '~/modules/document/dto/signed-blockchain-document.dto';

@ObjectType('BlockchainDecision', {
  description: 'Запись в таблице блокчейна о процессе принятия решения советом кооператива',
})
export class BlockchainDecisionDTO implements SovietContract.Tables.Decisions.IDecision {
  @Field(() => Number)
  id!: number | string;

  @Field()
  coopname!: string;

  @Field()
  username!: string;

  @Field()
  type!: string;

  @Field(() => Number)
  batch_id!: number | string;

  @Field(() => SignedBlockchainDocumentDTO)
  statement!: SignedBlockchainDocumentDTO;

  @Field(() => [String])
  votes_for!: string[];

  @Field(() => [String])
  votes_against!: string[];

  @Field()
  validated!: boolean;

  @Field()
  approved!: boolean;

  @Field()
  authorized!: boolean;

  @Field()
  authorized_by!: string;

  @Field(() => SignedBlockchainDocumentDTO)
  authorization!: SignedBlockchainDocumentDTO;

  @Field()
  created_at!: string;

  @Field()
  expired_at!: string;

  @Field()
  meta!: string;

  @Field(() => String, { nullable: true })
  callback_contract!: string;

  @Field(() => String, { nullable: true })
  confirm_callback!: string;

  @Field(() => String, { nullable: true })
  decline_callback!: string;

  @Field(() => String, { nullable: true })
  hash!: string;

  constructor(data?: any) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
