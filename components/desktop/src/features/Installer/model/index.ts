import type { Mutations } from '@coopenomics/sdk';
import { useInstallCooperativeStore } from 'src/entities/Installer/model'
import { api } from '../api'

export type IInstallInput = Mutations.System.InstallSystem.IInput['data']
export type IInstallOutput = Mutations.System.InstallSystem.IOutput[typeof Mutations.System.InstallSystem.name]

export const useInstallCooperative = () => {
  const store = useInstallCooperativeStore()

  async function install(): Promise<IInstallOutput> {
    if (!store.wif)
      throw new Error('Ключ не установлен')

    if (!store.vars)
      throw new Error('Переменные не установлены')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const soviet = store.soviet.map(({ id, type, ...rest }) => rest);

    const installData: IInstallInput = {
      wif: store.wif,
      soviet,
      vars: store.vars
    };

    return await api.install(installData);
  }

  return {
    install,
  }
}
