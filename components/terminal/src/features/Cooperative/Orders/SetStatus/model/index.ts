import { useOrderStore } from 'src/entities/Order'
import { api } from '../api'

export const useSetStatus = () => {
  const orderStore = useOrderStore()

  const setPaidStatus = async (id: string) => {
    await api.setStatus(id, 'paid')
    setTimeout(() => orderStore.updateCoopOrders({username: orderStore.username, id}), 2000)
  }

  const setRefundedStatus = async (id: string) => {
    await api.setStatus(id, 'refunded')
    setTimeout(() => orderStore.updateCoopOrders({username: orderStore.username, id}), 2000)
  }

  return {setPaidStatus, setRefundedStatus}
}
