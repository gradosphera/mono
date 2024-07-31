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
  method_id: number;
  method_type: 'sbp' | 'bank_transfer';
  data: ISBPData | IBankTransferData;
}


export function useAddPaymentMethod() {
  const store = useWalletStore()
  const session = useSessionStore()

  async function addPaymentMethod(params: IAddPaymentMethod) {

    await store.update({
      coopname: COOPNAME,
      username: params.username,
    })


    params.method_id = (store.methods.sort((a, b) => b.method_id - a.method_id)[0]?.method_id || 0) + 1

    console.log(store.methods, store.methods.length, params.method_id)
    await sendPOST(`/v1/payments/methods/${params.username}/add`, params)

    await store.update({
      coopname: COOPNAME,
      username: session.username
    })
  }

  return {
    addPaymentMethod
  }
}
