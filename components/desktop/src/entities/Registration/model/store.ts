import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Mutations, Zeus } from '@coopenomics/sdk'
import type { IDocument } from 'src/shared/lib/types/document'
import { api } from '../api'

// Типы из SDK
export type IGenerateRegistrationDocumentsOutput = Mutations.Registration.GenerateRegistrationDocuments.IOutput[typeof Mutations.Registration.GenerateRegistrationDocuments.name]
export type IGenerateRegistrationDocumentsInput = Mutations.Registration.GenerateRegistrationDocuments.IInput['data']
export type IGeneratedRegistrationDocument = IGenerateRegistrationDocumentsOutput['documents'][number]

/**
 * Расширенный тип документа регистрации с дополнительными полями для фронтенда
 */
export interface IRegistrationDocument extends IGeneratedRegistrationDocument {
  /** Подписанный документ (заполняется после подписи) */
  signed_document?: IDocument
  /** Принято ли соглашение (галочка) */
  accepted?: boolean
}

const namespace = 'registration'

export const useRegistrationStore = defineStore(namespace, () => {
  // Динамический список документов регистрации
  const registrationDocuments = ref<IRegistrationDocument[]>([])

  // Проверка, все ли соглашения приняты
  const allAgreementsAccepted = computed(() => {
    if (registrationDocuments.value.length === 0) return false
    return registrationDocuments.value.every((doc) => doc.accepted)
  })

  /**
   * Загрузить документы регистрации с бэкенда
   */
  const loadRegistrationDocuments = async (
    coopname: string,
    username: string,
    accountType: Zeus.AccountType
  ): Promise<IRegistrationDocument[]> => {
    const output = await api.generateRegistrationDocuments({
      coopname,
      username,
      account_type: accountType,
    })

    registrationDocuments.value = output.documents.map((doc) => ({
      ...doc,
      accepted: false,
      signed_document: undefined,
    }))

    return registrationDocuments.value
  }

  /**
   * Обновить статус принятия соглашения
   */
  const setAgreementAccepted = (id: string, accepted: boolean) => {
    const doc = registrationDocuments.value.find((d) => d.id === id)
    if (doc) {
      doc.accepted = accepted
    }
  }

  /**
   * Обновить подписанный документ
   */
  const setSignedDocument = (id: string, signedDoc: IDocument) => {
    const doc = registrationDocuments.value.find((d) => d.id === id)
    if (doc) {
      doc.signed_document = signedDoc
    }
  }

  /**
   * Получить документы для линковки в заявление (только те, что нужно линковать)
   */
  const getDocumentsForLinking = computed(() => {
    return registrationDocuments.value
      .filter((doc) => doc.link_to_statement && doc.signed_document)
      .map((doc) => doc.signed_document?.doc_hash)
      .filter((hash): hash is string => hash !== undefined)
  })

  /**
   * Получить документ по ID
   */
  const getDocumentById = (id: string): IRegistrationDocument | undefined => {
    return registrationDocuments.value.find((doc) => doc.id === id)
  }

  /**
   * Очистить документы регистрации
   */
  const clearRegistrationDocuments = () => {
    registrationDocuments.value = []
  }

  return {
    // State
    registrationDocuments,

    // Computed
    allAgreementsAccepted,
    getDocumentsForLinking,

    // Actions
    loadRegistrationDocuments,
    setAgreementAccepted,
    setSignedDocument,
    getDocumentById,
    clearRegistrationDocuments,
  }
}, {
  persist: true,
})
