import { useSessionStore } from 'src/entities/Session'
import { useWalletStore } from 'src/entities/Wallet'
import { sendPOST } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';

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
  const { info } = useSystemStore()

  async function addPaymentMethod(params: IAddPaymentMethod) {

    await store.loadUserWallet({
      coopname: info.coopname,
      username: params.username,
    })


    await sendPOST(`/v1/methods/${params.username}/add`, params)

    await store.loadUserWallet({
      coopname: info.coopname,
      username: session.username
    })
  }

  return {
    addPaymentMethod
  }
}
