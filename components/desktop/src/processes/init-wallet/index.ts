// processes/init-wallet/index.ts
import { useSessionStore } from 'src/entities/Session'
import { useCurrentUserStore } from 'src/entities/User'
import { useWalletStore } from 'src/entities/Wallet'
import { useSystemStore } from 'src/entities/System/model'
import { useAccountStore } from 'src/entities/Account/model'

export function useInitWalletProcess() {
  const session = useSessionStore()
  const user = useCurrentUserStore()
  const wallet = useWalletStore()
  const { info } = useSystemStore()
  const account = useAccountStore()

  const run = async () => {
    await session.init()

    if (!session.isAuth) return

    try {
      await account.getAccount(session.username)

      await user.loadProfile(session.username, info.coopname)

      await wallet.loadUserWallet({
        coopname: info.coopname,
        username: session.username,
      })

      session.loadComplete = true
    } catch (e) {
      console.error(e)
    }

    // фоновая проверка каждые 10 сек
    setTimeout(run, 10_000)
  }

  return { run }
}
