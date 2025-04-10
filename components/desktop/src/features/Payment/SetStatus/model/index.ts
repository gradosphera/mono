import { usePaymentStore } from 'src/entities/Payment'
import { api } from '../api'

export const useSetStatus = () => {
  const orderStore = usePaymentStore()

  const setPaidStatus = async (id: string) => {
    await api.setStatus(id, 'paid')
    setTimeout(() => orderStore.updateCoopPayments({username: orderStore.username, id}), 2000)
  }

  const setRefundedStatus = async (id: string) => {
    await api.setStatus(id, 'refunded')
    setTimeout(() => orderStore.updateCoopPayments({username: orderStore.username, id}), 2000)
  }

  const setCompletedStatus = async (id: string) => {
    await api.setStatus(id, 'completed')
    setTimeout(() => orderStore.updateCoopPayments({username: orderStore.username, id}), 2000)
  }

  return {setPaidStatus, setRefundedStatus, setCompletedStatus}
}
