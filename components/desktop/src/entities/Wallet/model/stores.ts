import { defineStore } from 'pinia';
import { api } from '../api';
import {
  IDepositData,
  IWithdrawData,
  ExtendedProgramWalletData,
  ICreateWithdraw,
  IPaymentMethodData,
} from './types';
import { IPaymentOrder } from 'src/shared/lib/types/payments';
import { ILoadUserWallet } from './types';
import { ICreateDeposit } from 'src/shared/lib/types/payments';
import { Ref, ref } from 'vue';
import { sendPOST } from 'src/shared/api';
import type { SovietContract } from 'cooptypes';

const namespace = 'wallet';

interface IWalletStore {
  /*  доменный интерфейс кошелька пользователя */
  // wallet: Ref<IWalletData>;
  program_wallets: Ref<ExtendedProgramWalletData[]>;
  deposits: Ref<IDepositData[]>;
  withdraws: Ref<IWithdrawData[]>;
  methods: Ref<IPaymentMethodData[]>;
  agreements: Ref<SovietContract.Tables.Agreements.IAgreement[]>;

  loadUserWalet: (params: ILoadUserWallet) => Promise<void>;

  //TODO move to features
  createDeposit: (params: ICreateDeposit) => Promise<IPaymentOrder>;
  createWithdraw: (params: ICreateWithdraw) => Promise<void>;
}

export const useWalletStore = defineStore(namespace, (): IWalletStore => {
  // const wallet = ref<IWalletData>({
  //   username: '',
  //   coopname: '',
  //   available: `0.0000 ${CURRENCY}`,
  //   blocked: `0.0000 ${CURRENCY}`,
  //   minimum: `0.0000 ${CURRENCY}`,
  //   initial: `0.0000 ${CURRENCY}`,
  // });

  const deposits = ref<IDepositData[]>([]);
  const withdraws = ref<IWithdrawData[]>([]);
  const program_wallets = ref<ExtendedProgramWalletData[]>([]);
  const methods = ref<IPaymentMethodData[]>([]);
  const agreements = ref<SovietContract.Tables.Agreements.IAgreement[]>([]);


  const loadUserWalet = async (params: ILoadUserWallet) => {

    // const createEmptyWallet = (): IWalletData => ({
    //   username: '',
    //   coopname: '',
    //   available: `0.0000 ${CURRENCY}`,
    //   blocked: `0.0000 ${CURRENCY}`,
    //   minimum: `0.0000 ${CURRENCY}`,
    //   initial: `0.0000 ${CURRENCY}`,
    // });

    try {
      const data = await Promise.all([
        // api.loadSingleUserWalletData(params),
        api.loadUserDepositsData(params),
        api.loadUserWithdrawsData(params),
        api.loadUserProgramWalletsData(params),
        api.loadMethods(params),
        api.loadUserAgreements(params.coopname, params.username)
      ]);

      // wallet.value = data[0] ?? createEmptyWallet();
      deposits.value = data[0] ?? [];
      withdraws.value = data[1] ?? [];
      program_wallets.value = data[2] ?? [];
      methods.value = data[3] ?? [];
      agreements.value = data[4] ?? [];

    } catch (e: any) {
      console.log(e);
    }
  };

  const createDeposit = async (
    params: ICreateDeposit
  ): Promise<IPaymentOrder> => {
    return sendPOST('/v1/orders/deposit', params);
  };

  const createWithdraw = async (params: ICreateWithdraw): Promise<void> => {
    console.log('here', params)
  };

  return {
    // wallet,
    program_wallets,
    deposits,
    withdraws,
    methods,
    agreements,
    loadUserWalet,
    createDeposit,
    createWithdraw,
  };
});
