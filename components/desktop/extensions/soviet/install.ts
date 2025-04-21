import { markRaw } from 'vue'
import { ListOfQuestionsPage } from 'src/pages/Cooperative/ListOfQuestions'
import { ListOfParticipantsPage } from 'src/pages/Cooperative/ListOfParticipants'
import { ListOfDocumentsPage } from 'src/pages/Cooperative/ListOfDocuments'
import { ListOfOrdersPage } from 'src/pages/Cooperative/ListOfOrders'
import { ListOfMeetsPage } from 'src/pages/Cooperative/ListOfMeets'

export default async function () {
  return {
    workspace: 'soviet',
    routes: [
      {
        meta: {
          title: 'Стол совета',
          icon: 'fa-regular fa-circle',
          roles: ['chairman', 'member'],
        },
        path: '/:coopname/soviet',
        name: 'soviet',
        children: [
          {
            path: 'agenda',
            name: 'agenda',
            component: markRaw(ListOfQuestionsPage),
            meta: {
              title: 'Повестка',
              icon: 'fa-solid fa-check-to-slot',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'participants',
            name: 'participants',
            component: markRaw(ListOfParticipantsPage),
            meta: {
              title: 'Пайщики',
              icon: 'fa-solid fa-users',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'documents',
            name: 'documents',
            component: markRaw(ListOfDocumentsPage),
            meta: {
              title: 'Документы',
              icon: 'fa-solid fa-file-invoice',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'orders/:username?',
            name: 'orders',
            component: markRaw(ListOfOrdersPage),
            meta: {
              title: 'Платежи',
              icon: 'fa-solid fa-file-invoice',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'meets',
            name: 'meets',
            component: markRaw(ListOfMeetsPage),
            meta: {
              title: 'Общие собрания',
              icon: 'fa-solid fa-users-between-lines',
              roles: ['chairman', 'member'],
            },
          },
        ]
      }
    ]
  }
}
