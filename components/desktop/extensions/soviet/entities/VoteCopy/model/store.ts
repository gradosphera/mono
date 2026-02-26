import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IVoteCopyMySetting, IVoteCopyToMe } from './types'

const namespace = 'voteCopyStore'

interface IVoteCopyStore {
  mySettings: Ref<IVoteCopyMySetting[]>
  copiesToMe: Ref<IVoteCopyToMe[]>
  loadData: () => Promise<void>
}

export const useVoteCopyStore = defineStore(namespace, (): IVoteCopyStore => {
  const mySettings = ref<IVoteCopyMySetting[]>([])
  const copiesToMe = ref<IVoteCopyToMe[]>([])

  const loadData = async () => {
    const [my, toMe] = await Promise.all([
      api.loadMyVoteCopySettings(),
      api.loadWhoCopiesToMe(),
    ])
    mySettings.value = my
    copiesToMe.value = toMe
  }

  return {
    mySettings,
    copiesToMe,
    loadData,
  }
})
