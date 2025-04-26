import { usePaymentStore } from 'src/entities/Payment/model'
import { api } from '../api'
import { Zeus } from '@coopenomics/sdk'

export const useSetStatus = () => {
  const paymentStore = usePaymentStore()

  const setPaidStatus = async (id: string) => {
    await api.setPaymentStatus({ id, status: Zeus.PaymentStatus.PAID })
    setTimeout(() => paymentStore.updatePayments(), 2000)
  }

  const setRefundedStatus = async (id: string) => {
    await api.setPaymentStatus({ id, status: Zeus.PaymentStatus.REFUNDED })
    setTimeout(() => paymentStore.updatePayments(), 2000)
  }

  const setCompletedStatus = async (id: string) => {
    await api.setPaymentStatus({ id, status: Zeus.PaymentStatus.COMPLETED })
    setTimeout(() => paymentStore.updatePayments(), 2000)
  }

  return { setPaidStatus, setRefundedStatus, setCompletedStatus }
}
