// infrastructure/blockchain/blockchain.service.ts
import { Injectable } from '@nestjs/common';
import { Action, API, APIClient, PrivateKey } from '@wharfkit/antelope';
import { ContractKit, Table } from '@wharfkit/contract';
import { Session, TransactResult } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import config from '~/config/config';
import { BlockchainPort } from '~/domain/common/ports/blockchain.port';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';
import type { GetInfoResult } from '~/types/shared/blockchain.types';
import type { BlockchainAccountInterface } from '~/types/shared';

export type IndexPosition =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary'
  | 'quinary'
  | 'senary'
  | 'septenary'
  | 'octonary'
  | 'nonary'
  | 'denary';

@Injectable()
export class BlockchainService implements BlockchainPort {
  private readonly apiClient: APIClient;
  private readonly contractKit: ContractKit;
  private session!: Session;

  constructor(private readonly logger: WinstonLoggerService) {
    this.apiClient = new APIClient({ url: config.blockchain.url });
    this.contractKit = new ContractKit({ client: this.apiClient });
  }

  public initialize(username: string, wif: string): void {
    this.session = new Session({
      actor: username,
      permission: 'active',
      chain: {
        id: config.blockchain.id,
        url: config.blockchain.url,
      },
      walletPlugin: new WalletPluginPrivateKey(PrivateKey.fromString(wif)),
    });
  }

  public async getInfo(): Promise<GetInfoResult> {
    return (await this.apiClient.v1.chain.get_info()).toJSON();
  }

  public async getAccount(name: string): Promise<BlockchainAccountInterface | null> {
    try {
      const result = (await this.apiClient.v1.chain.get_account(name)).toJSON();
      return result;
    } catch (e) {
      return null;
    }
  }

  public async transact(actionOrActions: any | any[], broadcast = true): Promise<TransactResult> {
    if (Array.isArray(actionOrActions)) {
      return this.sendActions(actionOrActions, broadcast);
    } else {
      return this.sendAction(actionOrActions, broadcast);
    }
  }

  private async formActionFromAbi(action: any): Promise<any> {
    const { abi } = (await this.apiClient.v1.chain.get_abi(action.account)) ?? { abi: undefined };
    return Action.from(action, abi);
  }

  private async sendAction(action: any, broadcast = true): Promise<TransactResult> {
    const formedAction = await this.formActionFromAbi(action);
    return await this.session.transact({ action: formedAction }, { broadcast });
  }

  private async sendActions(actions: any[], broadcast = true): Promise<TransactResult> {
    const data: Action[] = [];
    for (const action of actions) {
      const formedAction = await this.formActionFromAbi(action);
      data.push(formedAction);
    }
    return await this.session.transact({ actions: data }, { broadcast });
  }

  public async getAllRows<T = any>(code: string, scope: string, tableName: string): Promise<any[]> {
    const { abi } = await this.apiClient.v1.chain.get_abi(code);
    if (!abi) throw new Error(`ABI контракта ${code} не найден`);

    const table = new Table({
      abi,
      account: code,
      name: tableName,
      client: this.apiClient,
    });

    const rows = await table.all({ scope });
    return JSON.parse(JSON.stringify(rows)) as T[];
  }

  public async query<T = any>(
    code: string,
    scope: string,
    tableName: string,
    options: {
      indexPosition?: IndexPosition;
      from?: string | number;
      to?: string | number;
      maxRows?: number;
      keyType?: 'name' | 'sha256' | 'i64';
    } = { indexPosition: 'primary', keyType: 'i64' }
  ): Promise<T[]> {
    const { indexPosition = 'primary', from, to, maxRows, keyType } = options;

    const { abi } = await this.apiClient.v1.chain.get_abi(code);
    if (!abi) throw new Error(`ABI контракта ${code} не найден`);

    const table = new Table({
      abi,
      account: code,
      name: tableName,
      client: this.apiClient,
    });
    const rows = await table.all({
      scope,
      index_position: indexPosition,
      key_type: keyType,
      from,
      to,
      maxRows,
    });
    return JSON.parse(JSON.stringify(rows)) as T[];
  }

  public async getSingleRow<T = any>(
    code: string,
    scope: string,
    tableName: string,
    primaryKey: API.v1.TableIndexType,
    indexPosition: IndexPosition = 'primary',
    keyType: keyof API.v1.TableIndexTypes = 'i64'
  ): Promise<T | null> {
    const { abi } = await this.apiClient.v1.chain.get_abi(code);
    if (!abi) throw new Error(`ABI контракта ${code} не найден`);

    const table = new Table({
      abi,
      account: code,
      name: tableName,
      client: this.apiClient,
    });

    const row = await table.get(primaryKey, {
      scope,
      index_position: indexPosition,
      key_type: keyType,
    });

    return row ? (JSON.parse(JSON.stringify(row)) as T) : null;
  }
}
