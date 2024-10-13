import { useUnionStore } from 'src/entities/Union/model';
import { api } from '../api';
import type { RegistratorContract } from 'cooptypes';

export function useLoadCooperatives() {
  async function loadOneCooperative(coopname: string): Promise<RegistratorContract.Tables.Cooperatives.ICooperative>{
    return api.loadCoopByUsername(coopname)
  }

  async function loadCooperatives(
  ): Promise<void> {
    const unionStore = useUnionStore()
    unionStore.coops = await api.loadCoops()
  }
  return { loadCooperatives, loadOneCooperative };
}
