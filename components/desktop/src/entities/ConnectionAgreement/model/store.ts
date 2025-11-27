import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DigitalDocument } from 'src/shared/lib/document'
import { useSessionStore } from 'src/entities/Session'
import { useLoadCooperatives } from 'src/features/Union/LoadCooperatives'
import { getCurrentInstance, type CurrentInstance } from '../api'
import { extractGraphQLErrorMessages } from 'src/shared/api/errors'
import type { ITariff, IConnectionAgreementState, ICooperativeFormData } from './types'


const namespace = 'connection-agreement'

export const useConnectionAgreementStore = defineStore(namespace, () => {
  // State
  const currentStep = ref<number>(0)
  const selectedTariff = ref<ITariff | null>(null)
  const isInitialized = ref<boolean>(false)
  const document = ref<any>(null)
  const signedDocument = ref<any>(null)
  const currentInstance = ref<CurrentInstance | null>(null)
  const currentInstanceLoading = ref<boolean>(false)
  const currentInstanceError = ref<string | null>(null)
  const isBadGateway = ref<boolean>(false)
  const coop = ref<any>(null)
  const formData = ref<ICooperativeFormData>({
    announce: '',
    initial: '',
    minimum: '',
    org_initial: '',
    org_minimum: ''
  })

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

  const setCoop = (coopData: any) => {
    coop.value = coopData
  }

  const setFormData = (data: ICooperativeFormData) => {
    formData.value = data
  }

  // Actions
  const generateDocument = async () => {
    console.log('🔄 Начинаем генерацию документа')
    const session = useSessionStore()
    const formDataValue = formData.value
    console.log('📋 Данные формы:', formDataValue)

    try {
      console.log('📄 Создаем новый DigitalDocument')
      const newDoc = new DigitalDocument()

    const params: any = {
      registry_id: 50,
      coopname: 'voskhod',
      username: session.username
    }

      // Передаем данные из формы в документ, если они есть
      if (formDataValue) {
        params.announce = formDataValue.announce
        params.initial = formDataValue.initial
        params.minimum = formDataValue.minimum
        params.org_initial = formDataValue.org_initial
        params.org_minimum = formDataValue.org_minimum
      }

      console.log('🔧 Генерируем документ с параметрами:', params)

      await newDoc.generate(params)

      console.log('✅ Документ успешно сгенерирован')
      document.value = newDoc
      return newDoc
    } catch (error) {
      console.error('❌ Ошибка при генерации документа:', error)
      throw error
    }
  }

  const signDocument = async () => {
    const session = useSessionStore()
    if (!document.value) {
      throw new Error('Документ не найден')
    }

    await document.value.sign(session.username)
    signedDocument.value = document.value.signedDocument
    return signedDocument.value
  }

  const clearSignedDocument = async () => {
    // Очищаем подписанный документ
    signedDocument.value = null

    // Регенерируем документ заново если есть данные формы
    if (formData.value) {
      await generateDocument()
    }
  }

  const reloadCooperative = async () => {
    const { loadOneCooperative } = useLoadCooperatives()
    const session = useSessionStore()

    try {
      const coopData = await loadOneCooperative(session.username)
      coop.value = coopData
      return coopData
    } catch (error) {
      console.error('Ошибка при перезагрузке кооператива:', error)
      throw error
    }
  }

  const loadCurrentInstance = async () => {
    try {
      currentInstanceLoading.value = true
      currentInstanceError.value = null
      // Сбрасываем флаг Bad Gateway при начале каждой загрузки
      isBadGateway.value = false
      const freshInstance = await getCurrentInstance()

      // Обновляем данные только если получили свежие данные
      // При ошибке оставляем старые данные в currentInstance (они могут быть из localStorage)
      if (freshInstance !== null) {
        currentInstance.value = freshInstance
      }

      console.log('Текущий инстанс загружен:', currentInstance.value)
    } catch (error: any) {

      currentInstanceError.value = extractGraphQLErrorMessages(error)

      // Не устанавливаем Bad Gateway для ошибки "Инстанс не найден"
      if (!currentInstanceError.value?.includes('Инстанс не найден')) {
        isBadGateway.value = true
      }

      // НЕ очищаем старые данные при ошибке - они остаются актуальными из localStorage
      // currentInstance.value остается как есть
      console.warn('Ошибка при загрузке текущего инстанса:', error)
    } finally {
      currentInstanceLoading.value = false
    }
  }

  const startInstanceAutoRefresh = async (intervalMs = 30000) => { // 30 секунд по умолчанию
    await loadCurrentInstance() // Первая загрузка

    const interval = setInterval(() => {
      loadCurrentInstance()
    }, intervalMs)

    // Функция для остановки автообновления
    const stop = () => clearInterval(interval)

    return stop
  }

  const reset = () => {
    currentStep.value = 1
    selectedTariff.value = null
    isInitialized.value = false
    document.value = null
    signedDocument.value = null
    currentInstance.value = null
    currentInstanceLoading.value = false
    currentInstanceError.value = null
    isBadGateway.value = false
    coop.value = null
    formData.value = {
      announce: '',
      initial: '',
      minimum: '',
      org_initial: '',
      org_minimum: ''
    }
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
    if (state.coop !== undefined) {
      coop.value = state.coop
    }
    if (state.formData !== undefined && state.formData !== null) {
      formData.value = state.formData
    }
  }

  return {
    // State
    currentStep,
    selectedTariff,
    isInitialized,
    document,
    signedDocument,
    currentInstance,
    currentInstanceLoading,
    currentInstanceError,
    isBadGateway,
    coop,
    formData,

    // Methods
    setCurrentStep,
    setSelectedTariff,
    setInitialized,
    setDocument,
    setSignedDocument,
    setCoop,
    setFormData,
    reset,
    initialize,

    // Actions
    generateDocument,
    signDocument,
    clearSignedDocument,
    reloadCooperative,
    loadCurrentInstance,
    startInstanceAutoRefresh
  }
}, {
  persist: true
})
