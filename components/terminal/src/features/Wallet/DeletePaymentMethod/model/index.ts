import { useSessionStore } from 'src/entities/Session'
import { useWalletStore } from 'src/entities/Wallet'
import { sendPOST } from 'src/shared/api';
import { COOPNAME } from 'src/shared/config'

export interface IDeletePaymentMethod {
  username: string;
  method_id: number;
}

export function useDeletePaymentMethod() {
  const store = useWalletStore()
  const session = useSessionStore()

  async function deletePaymentMethod(params: IDeletePaymentMethod) {
    const {username, method_id} = params

    await sendPOST(`/v1/payments/methods/${username}/delete`, {method_id})

    await store.loadUserWalet({
      coopname: COOPNAME,
      username: session.username
    })
  }

  return {
    deletePaymentMethod
  }
}
