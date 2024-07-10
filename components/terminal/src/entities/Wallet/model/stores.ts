import { defineStore } from 'pinia';
import { api } from '../api';
import {
  IWalletData,
  IDepositData,
  IWithdrawData,
  IPaymentOrder,
  ExtendedProgramWalletData,
} from './types';
import { ILoadUserWallet, ICreateDeposit } from './types';
import { Ref, ref } from 'vue';
import { sendPOST } from 'src/shared/api';
import { CURRENCY } from 'src/shared/config';

const namespace = 'wallet';

interface IWalletStore {
  /*  доменный интерфейс кошелька пользователя */
  wallet: Ref<IWalletData>;
  program_wallets: Ref<ExtendedProgramWalletData[]>;
  deposits: Ref<IDepositData[]>;
  withdraws: Ref<IWithdrawData[]>;
  update: (params: ILoadUserWallet) => Promise<void>;
  createDeposit: (params: ICreateDeposit) => Promise<IPaymentOrder>;
  createWithdraw: () => Promise<void>;
}

export const useWalletStore = defineStore(namespace, (): IWalletStore => {
  const wallet = ref({} as IWalletData);
  const deposits = ref([] as IDepositData[]);
  const withdraws = ref([] as IWithdrawData[]);
  const program_wallets = ref([] as ExtendedProgramWalletData[]);

  const createEmptyWallet = (): IWalletData => ({
    username: '',
    coopname: '',
    available: `0.0000 ${CURRENCY}`,
    blocked: `0.0000 ${CURRENCY}`,
    minimum: `0.0000 ${CURRENCY}`,
  });

  const update = async (params: ILoadUserWallet) => {
    try {
      const data = await Promise.all([
        api.loadSingleUserWalletData(params),
        api.loadUserDepositsData(params),
        api.loadUserWithdrawsData(params),
        api.loadUserProgramWalletsData(params),
      ]);
      wallet.value = data[0] ?? createEmptyWallet();
      deposits.value = data[1] ?? [];
      withdraws.value = data[2] ?? [];
      program_wallets.value = data[3] ?? [];
    } catch (e: any) {
      console.log(e);
    }
  };

  const createDeposit = async (
    params: ICreateDeposit
  ): Promise<IPaymentOrder> => {
    return sendPOST('/v1/orders/deposit', params);
  };
  const createWithdraw = async () => {
    //TODO
  };

  return {
    wallet,
    program_wallets,
    deposits,
    withdraws,
    update,
    createDeposit,
    createWithdraw,
  };
});
