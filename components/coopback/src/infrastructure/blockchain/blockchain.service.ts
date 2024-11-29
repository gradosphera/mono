// infrastructure/blockchain/blockchain.service.ts
import { Injectable } from '@nestjs/common';
import { Action, APIClient, PrivateKey } from '@wharfkit/antelope';
import { ContractKit, Table } from '@wharfkit/contract';
import { Session, TransactResult } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import config from '~/config/config';
import { BlockchainPort } from '~/domain/common/ports/blockchain.port';
import { WinstonLoggerService } from '~/modules/logger/logger-app.service';

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
    return this.session.transact({ action: formedAction }, { broadcast });
  }

  private async sendActions(actions: any[], broadcast = true): Promise<TransactResult> {
    const data: Action[] = [];
    for (const action of actions) {
      const formedAction = await this.formActionFromAbi(action);
      data.push(formedAction);
    }
    return this.session.transact({ actions: data }, { broadcast });
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
    } = { indexPosition: 'primary' }
  ): Promise<T[]> {
    const { indexPosition = 'primary', from, to, maxRows } = options;

    const { abi } = await this.apiClient.v1.chain.get_abi(code);
    if (!abi) throw new Error(`ABI контракта ${code} не найден`);

    const table = new Table({
      abi,
      account: code,
      name: tableName,
      client: this.apiClient,
    });

    const rows = await table.query({
      scope,
      index_position: indexPosition,
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
    primaryKey: string | number,
    indexPosition: IndexPosition = 'primary'
  ): Promise<T | null> {
    const { abi } = await this.apiClient.v1.chain.get_abi(code);
    if (!abi) throw new Error(`ABI контракта ${code} не найден`);

    const table = new Table({
      abi,
      account: code,
      name: tableName,
      client: this.apiClient,
    });

    const row = await table.get(String(primaryKey), {
      scope,
      index_position: indexPosition,
    });

    return row ? (JSON.parse(JSON.stringify(row)) as T) : null;
  }
}
