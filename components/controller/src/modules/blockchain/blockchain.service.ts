import { Action, APIClient, PrivateKey } from '@wharfkit/antelope';
import { ContractKit, Table } from '@wharfkit/contract';
import { Session, type TransactResult } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';

import { Injectable, Logger } from '@nestjs/common';
import { SystemContract } from 'cooptypes';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  public apiClient: APIClient;
  public contractKit: ContractKit;
  public session: Session;

  constructor() {
    this.apiClient = new APIClient({
      url: process.env.CHAIN_URL,
    });
    this.contractKit = new ContractKit({
      client: this.apiClient,
    });

    this.session = new Session({
      actor: process.env.PROVIDER_ACCOUNT,
      permission: 'active',
      chain: {
        id: process.env.CHAIN_ID as string,
        url: process.env.CHAIN_URL as string,
      },
      walletPlugin: new WalletPluginPrivateKey(
        PrivateKey.fromString(process.env.PROVIDER_WIF as string),
      ),
    });
  }

  public transact = async (
    actionOrActions: any | any[],
    broadcast = true,
  ): Promise<TransactResult | undefined> => {
    if (Array.isArray(actionOrActions)) {
      return await this.sendActions(actionOrActions, broadcast);
    } else {
      return await this.sendAction(actionOrActions, broadcast);
    }
  };

  public formActionFromAbi = async (action: any) => {
    const { abi } = (await this.apiClient.v1.chain.get_abi(action.account)) ?? {
      abi: undefined,
    };
    return Action.from(action, abi);
  };

  public sendAction = async (action: any, broadcast: boolean) => {
    const formedAction = await this.formActionFromAbi(action);

    return this.session.transact(
      {
        action: formedAction,
      },
      { broadcast },
    );
  };

  public sendActions = async (actions: any[], broadcast: boolean) => {
    const data: Action[] = [];

    for (const action of actions) {
      const formedAction = await this.formActionFromAbi(action);
      data.push(formedAction);
    }

    return this.session.transact(
      {
        actions: data,
      },
      { broadcast },
    );
  };

  public async transfer(
    from: string,
    to: string,
    quantity: string,
    memo: string,
  ): Promise<void> {
    const data = {
      account: 'eosio.token',
      name: 'transfer',
      authorization: [
        {
          actor: process.env.PROVIDER_ACCOUNT as string,
          permission: 'active',
        },
      ],
      data: {
        from,
        to,
        quantity,
        memo,
      },
    };

    await this.transact(data);
  }

  public async powerup(
    data: SystemContract.Actions.Powerup.IPowerup,
  ): Promise<void> {
    const action = {
      account: 'eosio',
      name: SystemContract.Actions.Powerup.actionName,
      authorization: [
        {
          actor: process.env.PROVIDER_ACCOUNT as string,
          permission: 'active',
        },
      ],
      data,
    };

    await this.transact(action);
  }

  public async getAllTableRows(
    code: string,
    scope: string,
    name: string,
  ): Promise<any[]> {
    const { abi } = await this.apiClient.v1.chain.get_abi(code);

    if (!abi) throw new Error(`ABI контракта ${code} не найден`);

    const table = new Table({
      abi,
      account: code,
      name: name,
      client: this.apiClient,
    });

    const rows = await table.all({ scope });

    return JSON.parse(JSON.stringify(rows));
  }
}
