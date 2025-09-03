import { ObjectType, Field, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

/**
 * Составные части `BlockchainAction`
 */
@ObjectType('ActionAuthorization')
export class ActionAuthorizationDTO {
  @Field()
  actor!: string;

  @Field()
  permission!: string;
}

@ObjectType('AccountRamDelta')
export class AccountRamDeltaDTO {
  @Field()
  account!: string;

  @Field(() => Int)
  delta!: number;
}

@ObjectType('ActionReceipt')
export class ActionReceiptDTO {
  @Field()
  receiver!: string;

  @Field()
  act_digest!: string;

  @Field()
  global_sequence!: string;

  @Field()
  recv_sequence!: string;

  @Field(() => [AuthSequenceDTO])
  auth_sequence!: AuthSequenceDTO[];

  @Field(() => Int)
  code_sequence!: number;

  @Field(() => Int)
  abi_sequence!: number;
}

@ObjectType('AuthSequence')
export class AuthSequenceDTO {
  @Field()
  account!: string;

  @Field()
  sequence!: string;
}

@ObjectType('BlockchainAction', {
  description: 'Объект действия в блокчейне',
})
export class BlockchainActionDTO {
  @Field()
  transaction_id!: string;

  @Field()
  account!: string;

  @Field(() => Int)
  block_num!: number;

  @Field()
  block_id!: string;

  @Field()
  chain_id!: string;

  @Field()
  name!: string;

  @Field()
  receiver!: string;

  @Field(() => [ActionAuthorizationDTO])
  authorization!: ActionAuthorizationDTO[];

  @Field(() => GraphQLJSON, { description: 'Данные действия в формате JSON' })
  data!: any; // Можно строго типизировать, но потом и если будет нужно.

  @Field(() => Int)
  action_ordinal!: number;

  @Field()
  global_sequence!: string;

  @Field(() => [AccountRamDeltaDTO])
  account_ram_deltas!: AccountRamDeltaDTO[];

  @Field()
  console!: string;

  @Field(() => ActionReceiptDTO)
  receipt!: ActionReceiptDTO;

  @Field(() => Int)
  creator_action_ordinal!: number;

  @Field()
  context_free!: boolean;

  @Field(() => Int)
  elapsed!: number;

  constructor(data?: any) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
