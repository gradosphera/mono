import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';
// import { api } from '../api'
import { useCurrentUser } from 'src/entities/Session';
import { useRegistratorStore } from 'src/entities/Registrator';

export function useLogoutUser() {
  async function logout(): Promise<void> {
    const global = useGlobalStore();
    //TODO: "начать с начала" при регистрации бажит на это - да и в целом пора бы маршруты срезать эти
    await useRegistratorStore().clearUserData();

    await global.logout();

    useSessionStore().close();
    useCurrentUser().clearAccount();
  }

  return {
    logout,
  };
}
