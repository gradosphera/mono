import { useUnionStore } from 'src/entities/Union/model';
import { api } from '../api';

export function useLoadCooperatives() {
  async function loadCooperatives(
  ): Promise<void> {
    const unionStore = useUnionStore()
    unionStore.coops = await api.loadCoops()
  }
  return { loadCooperatives };
}
