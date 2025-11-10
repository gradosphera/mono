import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ITariff, IConnectionAgreementState } from './types'


const namespace = 'connection-agreement'

export const useConnectionAgreementStore = defineStore(namespace, () => {
  // State
  const currentStep = ref<number>(1)
  const selectedTariff = ref<ITariff | null>(null)
  const isInitialized = ref<boolean>(false)
  const document = ref<any>(null)
  const signedDocument = ref<any>(null)

  // Methods
  const setCurrentStep = (step: number) => {
    currentStep.value = step
  }

  const setSelectedTariff = (tariff: ITariff | null) => {
    selectedTariff.value = tariff
  }

  const setInitialized = (initialized: boolean) => {
    isInitialized.value = initialized
  }

  const setDocument = (doc: any) => {
    document.value = doc
  }

  const setSignedDocument = (doc: any) => {
    signedDocument.value = doc
  }

  const reset = () => {
    currentStep.value = 1
    selectedTariff.value = null
    isInitialized.value = false
    document.value = null
    signedDocument.value = null
  }

  const initialize = (state: Partial<IConnectionAgreementState>) => {
    if (state.currentStep !== undefined) {
      currentStep.value = state.currentStep
    }
    if (state.selectedTariff !== undefined) {
      selectedTariff.value = state.selectedTariff
    }
    if (state.isInitialized !== undefined) {
      isInitialized.value = state.isInitialized
    }
    if (state.document !== undefined) {
      document.value = state.document
    }
    if (state.signedDocument !== undefined) {
      signedDocument.value = state.signedDocument
    }
  }

  return {
    // State
    currentStep,
    selectedTariff,
    isInitialized,
    document,
    signedDocument,

    // Methods
    setCurrentStep,
    setSelectedTariff,
    setInitialized,
    setDocument,
    setSignedDocument,
    reset,
    initialize
  }
}, {
  persist: true
})
