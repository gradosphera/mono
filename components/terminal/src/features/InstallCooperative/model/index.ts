import { useInstallCooperativeStore } from 'src/entities/Installer/model'

export const useInstallCooperative = () => {
  const store = useInstallCooperativeStore()

  async function install() {
    console.log('install', store.data)
  }

  return {
    install
  }
}
