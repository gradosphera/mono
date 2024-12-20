import { Field, ObjectType, Int } from '@nestjs/graphql';
import type { GetInfoResult } from '~/types/shared/blockchain.types';

@ObjectType({ description: 'Информация о состоянии блокчейна' })
export class BlockchainInfoDTO implements GetInfoResult {
  @Field(() => String, { description: 'Версия сервера' })
  server_version: string;

  @Field(() => String, { description: 'Идентификатор цепочки (chain ID)' })
  chain_id: string;

  @Field(() => Int, { description: 'Номер головного блока' })
  head_block_num: number;

  @Field(() => Int, { description: 'Номер последнего необратимого блока' })
  last_irreversible_block_num: number;

  @Field(() => String, { description: 'Идентификатор последнего необратимого блока' })
  last_irreversible_block_id: string;

  @Field(() => String, { nullable: true, description: 'Время последнего необратимого блока' })
  last_irreversible_block_time?: string;

  @Field(() => String, { description: 'Идентификатор головного блока' })
  head_block_id: string;

  @Field(() => String, { description: 'Время головного блока' })
  head_block_time: string;

  @Field(() => String, { description: 'Прозводитель головного блока' })
  head_block_producer: string;

  @Field(() => Int, { description: 'Виртуальный лимит CPU для блока' })
  virtual_block_cpu_limit: number;

  @Field(() => Int, { description: 'Виртуальный лимит сети для блока' })
  virtual_block_net_limit: number;

  @Field(() => Int, { description: 'Лимит CPU для блока' })
  block_cpu_limit: number;

  @Field(() => Int, { description: 'Лимит сети для блока' })
  block_net_limit: number;

  @Field(() => String, { nullable: true, description: 'Строковое представление версии сервера' })
  server_version_string?: string;

  @Field(() => Int, { nullable: true, description: 'Номер головного блока в форк базе данных' })
  fork_db_head_block_num?: number;

  @Field(() => String, { nullable: true, description: 'Идентификатор головного блока в форк базе данных' })
  fork_db_head_block_id?: string;

  // Конструктор
  constructor(data: GetInfoResult) {
    this.server_version = data.server_version;
    this.chain_id = String(data.chain_id);
    this.head_block_num = Number(data.head_block_num);
    this.last_irreversible_block_num = Number(data.last_irreversible_block_num);
    this.last_irreversible_block_id = String(data.last_irreversible_block_id);
    this.head_block_id = String(data.head_block_id);
    this.head_block_time = String(data.head_block_time);
    this.head_block_producer = String(data.head_block_producer);
    this.virtual_block_cpu_limit = Number(data.virtual_block_cpu_limit);
    this.virtual_block_net_limit = Number(data.virtual_block_net_limit);
    this.block_cpu_limit = Number(data.block_cpu_limit);
    this.block_net_limit = Number(data.block_net_limit);
    this.server_version_string = data.server_version_string;
    this.fork_db_head_block_num = Number(data.fork_db_head_block_num);
    this.fork_db_head_block_id = String(data.fork_db_head_block_id);
  }
}
