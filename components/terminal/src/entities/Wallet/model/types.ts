import { SovietContract, GatewayContract } from 'cooptypes';

export type IProgramWalletData =
  SovietContract.Tables.ProgramWallets.IProgramWallet;
export type ICoopMarketProgramData =
  SovietContract.Tables.MarketPrograms.IMarketPrograms;

export type ExtendedProgramWalletData = IProgramWalletData & {
  program_type: string;
  program_details: ICoopMarketProgramData; // | или другие типы будущих программ
};

export type IDepositData = GatewayContract.Tables.Deposits.IDeposits;
export type IWithdrawData = GatewayContract.Tables.Withdraws.IWithdraws;
export type IWalletData = SovietContract.Tables.Wallets.IWallets;

export interface ILoadSingleUserWallet {
  coopname: string;
  username: string;
}

export interface ILoadSingleUserDeposit {
  coopname: string;
  username: string;
  deposit_id: string | number;
}

export interface ILoadSingleUserWithdraw {
  coopname: string;
  username: string;
  withdraw_id: string | number;
}

export interface ILoadSingleUserProgramWallet {
  coopname: string;
  username: string;
  wallet_id: string | number;
}

export interface ILoadUserDeposits {
  coopname: string;
  username: string;
}

export interface ILoadUserWithdraws {
  coopname: string;
  username: string;
}

export interface ILoadUserProgramWallets {
  coopname: string;
  username: string;
}

export interface ILoadUserWallet {
  coopname: string;
  username: string;
}

export interface ICreateDeposit {
  quantity: string;
  provider: 'yookassa';
}

export interface IPaymentOrder {
  order_id: string | number; // Идентификатор платежа в блокчейне
  provider: string; // Идентификатор банковского процессинга
  details: {
    token: string;
    url: string;
  };
}
