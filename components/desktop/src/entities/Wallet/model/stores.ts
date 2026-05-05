import { defineStore } from 'pinia';
import { api } from '../api';
import {
  IDepositData,
  IWithdrawData,
  ExtendedProgramWalletData,
  IPaymentMethodData,
  IUserAgreement,
} from './types';
import { ILoadUserWallet } from './types';
import { Ref, ref } from 'vue';

const namespace = 'wallet';

interface IWalletStore {
  /*  доменный интерфейс кошелька пользователя */
  program_wallets: Ref<ExtendedProgramWalletData[]>;
  deposits: Ref<IDepositData[]>;
  withdraws: Ref<IWithdrawData[]>;
  methods: Ref<IPaymentMethodData[]>;
  agreements: Ref<IUserAgreement[]>;

  loadUserWallet: (params: ILoadUserWallet) => Promise<void>;
}

export const useWalletStore = defineStore(namespace, (): IWalletStore => {
  const deposits = ref<IDepositData[]>([]);
  const withdraws = ref<IWithdrawData[]>([]);
  const program_wallets = ref<ExtendedProgramWalletData[]>([]);
  const methods = ref<IPaymentMethodData[]>([]);
  const agreements = ref<IUserAgreement[]>([]);

  const loadUserWallet = async (params: ILoadUserWallet) => {
    try {
      const data = await Promise.all([
        api.loadUserDepositsData(params),
        api.loadUserWithdrawsData(params),
        api.loadUserProgramWalletsData(params),
        api.loadMethods(params),
        api.loadUserAgreements(params.coopname, params.username),
      ]);

      deposits.value = data[0] ?? [];
      withdraws.value = data[1] ?? [];
      program_wallets.value = data[2] ?? [];
      methods.value = data[3] ?? [];
      agreements.value = data[4] ?? [];
    } catch (e: any) {
      console.log(e);
    }
  };

  return {
    program_wallets,
    deposits,
    withdraws,
    methods,
    agreements,
    loadUserWallet,
  };
});
