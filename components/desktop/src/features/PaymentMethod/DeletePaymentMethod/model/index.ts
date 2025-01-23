import { useSessionStore } from 'src/entities/Session'
import { useWalletStore } from 'src/entities/Wallet'
import { sendPOST } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';

export interface IDeletePaymentMethod {
  username: string;
  method_id: string;
}

export function useDeletePaymentMethod() {
  const store = useWalletStore()
  const session = useSessionStore()

  async function deletePaymentMethod(params: IDeletePaymentMethod) {
    const {username, method_id} = params
    const { info } = useSystemStore()

    await sendPOST(`/v1/methods/${username}/delete`, {method_id})

    await store.loadUserWalet({
      coopname: info.coopname,
      username: session.username
    })
  }

  return {
    deletePaymentMethod
  }
}
