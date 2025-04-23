import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api'
import type { Cooperative } from 'cooptypes'
import type { DocumentType, IDocumentStore, IGetDocuments, IPagination } from './types'
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
  
  // Информация о пагинации
  const pagination = ref<IPagination>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 0
  })

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
          additionalFilters: filter
        },
        type: documentType.value,
        page: 1,
        limit: 10
      }

      const result = await api.loadDocuments(data)
      
      // Приведение типов для совместимости
      documents.value = result.items as unknown as Cooperative.Document.IComplexDocument[]
      
      // Сохраняем информацию о пагинации
      pagination.value = {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage
      }
      
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
    pagination,
    loadDocuments,
    changeDocumentType
  }
})
