import { useInstallCooperativeStore } from 'src/entities/Installer/model'
import { api } from '../api'
import { IInstall } from 'coopback'

export const useInstallCooperative = () => {
  const store = useInstallCooperativeStore()

  async function install(data: IInstall) {
    await api.install(data)
  }

  return {
    install
  }
}
