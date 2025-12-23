import { useSessionStore } from 'src/entities/Session'
import { useWalletStore } from 'src/entities/Wallet'
import { useSystemStore } from 'src/entities/System/model';
import { api } from '../api';
import type { Mutations } from '@coopenomics/sdk';

export type IDeletePaymentMethodInput = Mutations.PaymentMethods.DeletePaymentMethod.IInput['data']

export function useDeletePaymentMethod() {
  const store = useWalletStore()
  const session = useSessionStore()
  const { info } = useSystemStore()

  async function deletePaymentMethod(data: IDeletePaymentMethodInput) {
    await api.deletePaymentMethod(data)

    await store.loadUserWallet({
      coopname: info.coopname,
      username: session.username
    })
  }

  return {
    deletePaymentMethod
  }
}
