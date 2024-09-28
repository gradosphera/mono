import { useInstallCooperativeStore } from 'src/entities/Installer/model'
import { api } from '../api'
import type { IInstall } from 'coopback'

export const useInstallCooperative = () => {
  const store = useInstallCooperativeStore()

  async function install(data: IInstall) {
    await api.install(data)
  }

  return {
    install
  }
}
