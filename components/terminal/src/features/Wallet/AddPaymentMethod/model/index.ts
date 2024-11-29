import { useSessionStore } from 'src/entities/Session'
import { useWalletStore } from 'src/entities/Wallet'
import { sendPOST } from 'src/shared/api';
import { COOPNAME } from 'src/shared/config'

export interface ISBPData {
  phone: string;
}

export interface IBankTransferData {
  account_number: string;
  bank_name: string;
  card_number?: string;
  currency: string;
  details: {
    bik: string;
    corr: string;
    kpp: string;
  };
}

export interface IAddPaymentMethod {
  username: string;
  method_id: string;
  method_type: 'sbp' | 'bank_transfer';
  data: ISBPData | IBankTransferData;
}


export function useAddPaymentMethod() {
  const store = useWalletStore()
  const session = useSessionStore()

  async function addPaymentMethod(params: IAddPaymentMethod) {

    await store.loadUserWalet({
      coopname: COOPNAME,
      username: params.username,
    })


    params.method_id = '1'

    await sendPOST(`/v1/methods/${params.username}/add`, params)

    await store.loadUserWalet({
      coopname: COOPNAME,



      username: session.username
    })
  }

  return {
    addPaymentMethod
  }
}
