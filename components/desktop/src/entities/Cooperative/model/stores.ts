import { defineStore } from 'pinia';
import { Ref, ref, ComputedRef, computed } from 'vue';
import { api } from '../api';
import {
  IAddressesData,
  ICoopProgramData,
  ILoadCoopPrograms,
  ILoadCooperativeAddresses,
} from './types';
import { Cooperative, RegistratorContract } from 'cooptypes';

const namespace = 'cooperative';

interface ICooperativeStore {
  // методы
  loadAddresses: (params: ILoadCooperativeAddresses) => Promise<void>;
  loadPrograms: (params: ILoadCoopPrograms) => Promise<void>;
  loadPrivateCooperativeData: () => Promise<void>;
  loadPublicCooperativeData: (coopname: string) => Promise<void>;

  // данные
  programs: Ref<ICoopProgramData[]>;
  addresses: Ref<IAddressesData[]>;
  publicCooperativeData: Ref<
    RegistratorContract.Tables.Cooperatives.ICooperative | undefined
  >;
  privateCooperativeData: Ref<Cooperative.Model.ICooperativeData | undefined>;

  governSymbol: ComputedRef<string>;
}

export const useCooperativeStore = defineStore(
  namespace,
  (): ICooperativeStore => {
    const programs = ref([] as ICoopProgramData[]);
    const addresses = ref([] as IAddressesData[]);
    const publicCooperativeData =
      ref<RegistratorContract.Tables.Cooperatives.ICooperative>();
    const privateCooperativeData = ref<Cooperative.Model.ICooperativeData>();

    const governSymbol = computed(() => {
      if (publicCooperativeData.value) {
        const [, symbol] = publicCooperativeData.value.initial.split(' ');
        return symbol;
      } else return '';
    });


    const loadPrivateCooperativeData = async (): Promise<void> => {
      privateCooperativeData.value = await api.loadPrivateCooperativeData();
    };

    const loadPublicCooperativeData = async (
      coopname: string,
    ): Promise<void> => {
      publicCooperativeData.value =
        await api.loadPublicCooperativeData(coopname);
    };

    const loadPrograms = async (params: ILoadCoopPrograms): Promise<void> => {
      programs.value = await api.loadPrograms(params);
    };

    const loadAddresses = async (
      params: ILoadCooperativeAddresses,
    ): Promise<void> => {
      addresses.value = await api.loadCooperativeAddresses(params);
    };


    return {
      loadPrograms,
      loadAddresses,
      loadPublicCooperativeData,
      loadPrivateCooperativeData,
      programs,
      addresses,
      privateCooperativeData,
      publicCooperativeData,
      governSymbol,
    };
  },
);
