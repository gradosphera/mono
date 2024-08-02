import { defineStore } from 'pinia'
import { useSessionStore } from 'src/entities/Session';
import { useCurrentUserStore } from 'src/entities/User';
import { COOPNAME } from 'src/shared/config';

const namespace = 'cardstore'

interface ICardStore {
  initWallet: () => Promise<void>;
}


export const useCardStore = defineStore(namespace, (): ICardStore => {
  const currentUser = useCurrentUserStore();
  const session = useSessionStore();

  async function initWallet(): Promise<void> {
    if (!session.isAuth && !currentUser.userAccount){
      await session.init()
      if (session.isAuth)
        try{
          await currentUser.loadProfile(session.username, COOPNAME)
        } catch(e: any){
          console.error(e)
        }
    }
  }

  return {
    initWallet
  }
})
