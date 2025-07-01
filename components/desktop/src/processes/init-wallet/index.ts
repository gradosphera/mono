// processes/init-wallet/index.ts
import { useSessionStore } from 'src/entities/Session';
import { useWalletStore } from 'src/entities/Wallet';
import { useSystemStore } from 'src/entities/System/model';
import { useAccountStore } from 'src/entities/Account/model';

export function useInitWalletProcess() {
  const session = useSessionStore();
  const wallet = useWalletStore();
  const { info } = useSystemStore();
  const account = useAccountStore();

  const run = async () => {
    await session.init();

    if (!session.isAuth) return;

    try {
      const userAccount = await account.getAccount(session.username);

      // Устанавливаем аккаунт текущего пользователя в сессию
      if (userAccount) {
        session.setCurrentUserAccount(userAccount);
      }

      await wallet.loadUserWallet({
        coopname: info.coopname,
        username: session.username,
      });

      session.loadComplete = true;
    } catch (e) {
      console.error(e);
    }

    // фоновая проверка каждые 10 сек
    setTimeout(run, 10_000);
  };

  return { run };
}
