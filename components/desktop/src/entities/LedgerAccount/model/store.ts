import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';
import { api } from '../api';
import type { IGetLedgerInput, ILedgerState } from '../types';

const namespace = 'ledgerAccountStore';

interface ILedgerAccountStore {
  ledgerState: Ref<ILedgerState | undefined>;
  getLedgerState: (data: IGetLedgerInput) => Promise<ILedgerState | undefined>;
}

export const useLedgerAccountStore = defineStore(
  namespace,
  (): ILedgerAccountStore => {
    const ledgerState = ref<ILedgerState>();

    const getLedgerState = async (
      data: IGetLedgerInput,
    ): Promise<ILedgerState | undefined> => {
      ledgerState.value = await api.getLedger(data);
      return ledgerState.value;
    };

    return {
      ledgerState,
      getLedgerState,
    };
  },
);
