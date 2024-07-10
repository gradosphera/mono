import { defineStore } from 'pinia'
import {
  ILoadAllParentOffers,
  ILoadAllRequests,
  ILoadUserChildOrders,
  ILoadUserParentOffers,
  IClearRequests,
  IUpdateOneRequest,
  IRequestData,
  ILoadAllChildOrders,
} from './types'
import { Ref, ref } from 'vue'
import { api } from '../api'

const namespace = 'requests'

interface IRequestsStore {
  //методы
  loadAllRequests: (params: ILoadAllRequests) => Promise<void>
  updateOneRequest: (params: IUpdateOneRequest) => Promise<void>
  loadAllParentOffers: (params: ILoadAllParentOffers) => Promise<void>
  loadAllChildOrders: (params: ILoadAllChildOrders) => Promise<void>
  loadUserParentOffers: (params: ILoadUserParentOffers) => Promise<void>
  loadUserChildOrders: (params: ILoadUserChildOrders) => Promise<void>
  clear: (params: IClearRequests) => void //* очищаем хранилище
  //геттеры
  getAllPublishedParentOffers: () => IRequestData[]
  //данные
  allRequests: Ref<IRequestData[]>
  allParentOffers: Ref<IRequestData[]>
  allChildOrders: Ref<IRequestData[]>
  userParentOffers: Ref<IRequestData[]>
  userChildOrders: Ref<IRequestData[]>
  //userParentOrders - пока не реализуем
  //userChildOffers - пока не реализуем
}

export const useRequestStore = defineStore(namespace, (): IRequestsStore => {
  const allRequests = ref([] as IRequestData[])
  const allParentOffers = ref([] as IRequestData[])
  const allChildOrders = ref([] as IRequestData[])
  const userParentOffers = ref([] as IRequestData[])
  const userChildOrders = ref([] as IRequestData[])

  const clear = (params: IClearRequests): void => {
    if (params.target === 'allRequests') allRequests.value = []
    else if (params.target === 'allParentOffers') allParentOffers.value = []
    else if (params.target === 'allChildOrders') allChildOrders.value = []
    else if (params.target === 'userParentOffers') userParentOffers.value = []
    else if (params.target === 'userChildOrders') userChildOrders.value = []
  }

  const loadAllRequests = async (params: ILoadAllRequests): Promise<void> => {
    allRequests.value = (await api.loadAllRequests(params)).sort(
      (a, b) => Number(b.id) - Number(a.id)
    )
  }

  const updateOneRequest = async (params: IUpdateOneRequest): Promise<void> => {
    const request = (await api.loadOneRequest(params)) as IRequestData
    console.log('on update request: ', request)

    //ищем и обновляем объект по всему хранилищу
    allRequests.value = allRequests.value.map((req) => (req.id === request.id ? request : req))

    allParentOffers.value = allParentOffers.value.map((req) =>
      req.id === request.id ? request : req
    )
    allChildOrders.value = allChildOrders.value.map((req) =>
      req.id === request.id ? request : req
    )
    userParentOffers.value = userParentOffers.value.map((req) =>
      req.id === request.id ? request : req
    )
    userChildOrders.value = userChildOrders.value.map((req) =>
      req.id === request.id ? request : req
    )
  }

  const loadAllParentOffers = async (params: ILoadAllParentOffers): Promise<void> => {
    allParentOffers.value = (await api.loadAllParentOffers(params)).sort(
      (a, b) => Number(b.id) - Number(a.id)
    )
  }

  const loadAllChildOrders = async (params: ILoadAllChildOrders): Promise<void> => {
    allChildOrders.value = (await api.loadAllChildOrders(params)).sort(
      (a, b) => Number(b.id) - Number(a.id)
    )
  }

  const loadUserParentOffers = async (params: ILoadUserParentOffers): Promise<void> => {
    userParentOffers.value = (await api.loadUserParentOffers(params)).sort(
      (a, b) => Number(b.id) - Number(a.id)
    )
  }

  const loadUserChildOrders = async (params: ILoadUserChildOrders): Promise<void> => {
    userChildOrders.value = (await api.loadUserChildOrders(params)).sort(
      (a, b) => Number(b.id) - Number(a.id)
    )
  }

  const getAllPublishedParentOffers = (): IRequestData[] => {
    return allParentOffers.value.filter((el) => el.status == 'published')
  }

  return {
    loadAllRequests,
    updateOneRequest,
    loadAllParentOffers,
    loadAllChildOrders,
    loadUserParentOffers,
    loadUserChildOrders,
    clear,
    getAllPublishedParentOffers,
    allRequests,
    allParentOffers,
    allChildOrders,
    userParentOffers,
    userChildOrders,
  }
})
