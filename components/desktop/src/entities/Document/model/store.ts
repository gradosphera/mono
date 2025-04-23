import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api'
import type { Cooperative } from 'cooptypes'
import type { DocumentType, IDocumentStore, IGetDocuments } from './types'
import { useSystemStore } from 'src/entities/System/model'
import { FailAlert } from 'src/shared/api'

const namespace = 'documentStore'

/**
 * Хранилище для работы с документами
 */
export const useDocumentStore = defineStore(namespace, (): IDocumentStore => {
  const { info } = useSystemStore()

  const documents = ref<Cooperative.Document.IComplexDocument[]>([])
  const loading = ref(false)
  const documentType = ref<DocumentType>('newsubmitted')

  /**
   * Загрузка документов с сервера
   * @param filter параметры фильтрации
   * @param type тип документов для загрузки
   * @param hidden флаг скрытой загрузки (без индикатора)
   * @returns массив документов
   */
  const loadDocuments = async (
    filter: Record<string, any>,
    type?: DocumentType,
    hidden = false
  ): Promise<Cooperative.Document.IComplexDocument[]> => {
    try {
      loading.value = hidden ? false : true

      if (type) {
        documentType.value = type
      }

      const data: IGetDocuments = {
        filter: {
          receiver: info.coopname,
          ...filter
        },
        type: documentType.value
      }

      const result = await api.loadDocuments(data)
      documents.value = result
      loading.value = false
      return documents.value
    } catch (error: any) {
      loading.value = false
      console.error('Error loading documents:', error)
      FailAlert(error)
      return []
    }
  }

  /**
   * Изменяет тип документов для отображения
   */
  const changeDocumentType = async (type: DocumentType, filter: Record<string, any>) => {
    documentType.value = type
    await loadDocuments(filter, type)
  }

  return {
    documents,
    loading,
    documentType,
    loadDocuments,
    changeDocumentType
  }
})
