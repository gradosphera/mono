import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';
import { api } from '../api';
import {
  IAddressesData,
  ICoopMarketProgramData,
  ILoadCoopMarketPrograms,
  ILoadCooperativeAddresses,
  IAdministratorData,
} from './types';
import { Cooperative, RegistratorContract } from 'cooptypes';

const namespace = 'cooperative';

interface ICooperativeStore {
  // методы
  loadAddresses: (params: ILoadCooperativeAddresses) => Promise<void>;
  loadMarketPrograms: (params: ILoadCoopMarketPrograms) => Promise<void>;
  loadContacts: () => Promise<void>;
  loadPublicCooperativeData: (coopname: string) => Promise<void>;
  loadAdmins: (coopname: string) => Promise<void>;
  // данные
  admins: Ref<IAdministratorData[]>;
  marketPrograms: Ref<ICoopMarketProgramData[]>;
  addresses: Ref<IAddressesData[]>;
  contacts: Ref<Cooperative.Model.IContacts>
  publicCooperativeData: Ref<RegistratorContract.Tables.Organizations.IOrganization>;
}

export const useCooperativeStore = defineStore(
  namespace,
  (): ICooperativeStore => {
    const marketPrograms = ref([] as ICoopMarketProgramData[]);
    const addresses = ref([] as IAddressesData[]);
    const admins = ref([] as IAdministratorData[]);
    const publicCooperativeData = ref(
      {} as RegistratorContract.Tables.Organizations.IOrganization
    );

    const contacts = ref({} as Cooperative.Model.IContacts)

    const loadContacts = async(): Promise<void> => {
      contacts.value = await api.loadCooperativeData()
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
      loadMarketPrograms,
      loadAddresses,
      loadContacts,
      loadPublicCooperativeData,
      marketPrograms,
      addresses,
      contacts,
      publicCooperativeData,
      loadAdmins,
      admins,
    };
  }
);
