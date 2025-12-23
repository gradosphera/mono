import { useSessionStore } from 'src/entities/Session'
import { useWalletStore } from 'src/entities/Wallet'
import { useSystemStore } from 'src/entities/System/model';
import { api } from '../api';
import type { Mutations } from '@coopenomics/sdk';
import type { IBankTransferData, ISBPData } from 'src/entities/Wallet/model/types';

export type IAddPaymentMethodInput = Mutations.PaymentMethods.AddPaymentMethod.IInput['data']

// Re-export types for backward compatibility
export type { IBankTransferData, ISBPData }


export function useAddPaymentMethod() {
  const store = useWalletStore()
  const session = useSessionStore()
  const { info } = useSystemStore()

  async function addPaymentMethod(data: IAddPaymentMethodInput) {
    await store.loadUserWallet({
      coopname: info.coopname,
      username: data.username,
    })

    await api.addPaymentMethod(data)

    await store.loadUserWallet({
      coopname: info.coopname,
      username: session.username
    })
  }

  return {
    addPaymentMethod
  }
}
