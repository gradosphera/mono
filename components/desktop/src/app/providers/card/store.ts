import { defineStore } from 'pinia'
import { useSessionStore } from 'src/entities/Session';
import { useCurrentUserStore } from 'src/entities/User';
import { useWalletStore } from 'src/entities/Wallet';

import { useSystemStore } from 'src/entities/System/model';

const namespace = 'cardstore'

interface ICardStore {
  initWallet: () => Promise<void>;
}


export const useCardStore = defineStore(namespace, (): ICardStore => {
  const currentUser = useCurrentUserStore();
  const userWallet = useWalletStore()

  const session = useSessionStore();

  async function initWallet(): Promise<void> {
      const { info } = useSystemStore()

    // if (!session.isAuth && !currentUser.userAccount){
      await session.init()
      if (session.isAuth)
        try{
          await currentUser.loadProfile(session.username, info.coopname)
          await userWallet.loadUserWalet({coopname: info.coopname, username: session.username})
          session.loadComplete = true

        } catch(e: any){
          console.error(e)
        }
    // }
    setTimeout(() => initWallet(), 10000)
  }

  return {
    initWallet
  }
})
