import { usePaymentStore } from 'src/entities/Payment/model'
import { api } from '../api'
import { Zeus } from '@coopenomics/sdk'

export const useSetStatus = () => {
  const paymentStore = usePaymentStore()

  const setPaidStatus = async (id: string) => {
    await api.setPaymentStatus({ id, status: Zeus.PaymentStatus.PAID })
    setTimeout(async () => {
      await paymentStore.updatePayments({ id })
    }, 1000)
  }

  const setRefundedStatus = async (id: string) => {
    await api.setPaymentStatus({ id, status: Zeus.PaymentStatus.REFUNDED })
    setTimeout(async () => {
      await paymentStore.updatePayments({ id })
    }, 1000)
  }

  const setCompletedStatus = async (id: string) => {
    await api.setPaymentStatus({ id, status: Zeus.PaymentStatus.COMPLETED })
    setTimeout(async () => {
      await paymentStore.updatePayments({ id })
    }, 1000)
  }

  return { setPaidStatus, setRefundedStatus, setCompletedStatus }
}
