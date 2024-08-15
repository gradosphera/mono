import { defineStore } from 'pinia';
import { Ref, ref, ComputedRef, computed } from 'vue';
import { api } from '../api';
import {
  IAddressesData,
  ICoopMarketProgramData,
  ILoadCoopMarketPrograms,
  ILoadCooperativeAddresses,
  IAdministratorData,
} from './types';
import { Cooperative, FundContract, RegistratorContract } from 'cooptypes';

const namespace = 'cooperative';

interface ICooperativeStore {
  // методы
  loadFunds: (coopname: string) => Promise<void>;
  loadAddresses: (params: ILoadCooperativeAddresses) => Promise<void>;
  loadMarketPrograms: (params: ILoadCoopMarketPrograms) => Promise<void>;
  loadPrivateCooperativeData: () => Promise<void>;
  loadContacts: () => Promise<void>;
  loadPublicCooperativeData: (coopname: string) => Promise<void>;
  loadAdmins: (coopname: string) => Promise<void>;
  // данные
  admins: Ref<IAdministratorData[]>;
  marketPrograms: Ref<ICoopMarketProgramData[]>;
  addresses: Ref<IAddressesData[]>;
  contacts: Ref<Cooperative.Model.IContacts | undefined>
  publicCooperativeData: Ref<RegistratorContract.Tables.Cooperatives.ICooperative | undefined>;
  privateCooperativeData: Ref<Cooperative.Model.ICooperativeData | undefined>;

  coopWallet: Ref<FundContract.Tables.CoopWallet.ICoopWallet | undefined>
  accumulationFunds: Ref<FundContract.Tables.AccumulatedFunds.IAccumulatedFund[]>
  expenseFunds: Ref<FundContract.Tables.ExpensedFunds.IExpensedFund[]>

  governSymbol: ComputedRef<string>
}

export const useCooperativeStore = defineStore(
  namespace,
  (): ICooperativeStore => {
    const marketPrograms = ref([] as ICoopMarketProgramData[]);
    const addresses = ref([] as IAddressesData[]);
    const admins = ref([] as IAdministratorData[]);
    const publicCooperativeData = ref<RegistratorContract.Tables.Cooperatives.ICooperative>();
    const privateCooperativeData = ref<Cooperative.Model.ICooperativeData>()
    const coopWallet = ref<FundContract.Tables.CoopWallet.ICoopWallet>()
    const accumulationFunds = ref<FundContract.Tables.AccumulatedFunds.IAccumulatedFund[]>([])
    const expenseFunds = ref<FundContract.Tables.ExpensedFunds.IExpensedFund[]>([])

    const governSymbol = computed(() => {
      if (publicCooperativeData.value) {
        const [, symbol] = publicCooperativeData.value.initial.split(' ')
        return symbol
      } else return ''
    })

    const contacts = ref<Cooperative.Model.IContacts>()

    const loadFunds = async(coopname: string) : Promise<void> => {
      coopWallet.value = await api.loadCoopWallet(coopname)
      accumulationFunds.value = (await api.loadAccumulationFunds(coopname)).map(el => ({
        ...el,
        percent: Number(el.percent) / 10000
      }));

      expenseFunds.value = await api.loadExpenseFunds(coopname)
    }

    const loadContacts = async(): Promise<void> => {
      contacts.value = await api.loadContacts()
    }

    const loadPrivateCooperativeData = async(): Promise<void> => {
      privateCooperativeData.value = await api.loadPrivateCooperativeData()
    }

    const loadPublicCooperativeData = async (
      coopname: string
    ): Promise<void> => {
      publicCooperativeData.value = await api.loadPublicCooperativeData(
        coopname
      );
    };

    const loadMarketPrograms = async (
      params: ILoadCoopMarketPrograms
    ): Promise<void> => {
      marketPrograms.value = await api.loadMarketPrograms(params);
    };

    const loadAddresses = async (
      params: ILoadCooperativeAddresses
    ): Promise<void> => {
      addresses.value = await api.loadCooperativeAddresses(params);
    };

    const loadAdmins = async (coopname: string): Promise<void> => {
      admins.value = await api.loadAdmins(coopname);
    };

    return {
      loadFunds,
      loadMarketPrograms,
      loadAddresses,
      loadContacts,
      loadPublicCooperativeData,
      loadPrivateCooperativeData,
      marketPrograms,
      addresses,
      contacts,
      privateCooperativeData,
      publicCooperativeData,
      loadAdmins,
      admins,
      governSymbol,
      coopWallet,
      accumulationFunds,
      expenseFunds
    };
  }
);
