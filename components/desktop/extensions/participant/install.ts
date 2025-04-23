import { markRaw } from 'vue'
import { CoopCardPage } from 'src/pages/User/CardPage'
import { ConnectionAgreementPage } from 'src/pages/Union/ConnectionAgreement'
import { UserPaymentMethodsPage } from 'src/pages/User/PaymentMethodsPage'
import { ContactsPage } from 'src/pages/Contacts'
import { ListOfMeetsPage } from 'src/pages/Cooperative/ListOfMeets'
import { MeetDetailsPage } from 'src/pages/Cooperative/MeetDetails'
import { UserDocumentsPage } from 'src/pages/User/DocumentsPage'
import { agreementsBase } from 'src/shared/lib/consts/workspaces'

export default async function () {
  return {
    workspace: 'participant',
    routes: [
      {
        meta: {
          title: 'Стол пайщика',
          icon: 'fa-solid fa-id-card',
          roles: ['user', 'chairman', 'member'],
        },
        path: '/:coopname/user',
        name: 'participant',
        children: [
          {
            meta: {
              title: 'Карта пайщика',
              icon: '',
              roles: [],
              agreements: agreementsBase
            },
            path: 'card-coop',
            name: 'card-coop',
            component: markRaw(CoopCardPage),
            children: [],
          },
          {
            meta: {
              title: 'Подключение',
              icon: 'fas fa-link',
              roles: ['user'],
              conditions: 'isCoop === true && coopname === "voskhod"',
            },
            path: '/:coopname/connect',
            name: 'connect',
            component: markRaw(ConnectionAgreementPage),
          },
          {
            meta: {
              title: 'Реквизиты',
              icon: 'fas fa-link',
              roles: ['user', 'member', 'chairman']
            },
            path: '/:coopname/connect',
            name: 'payment-methods',
            component: markRaw(UserPaymentMethodsPage),
          },
          {
            meta: {
              title: 'Документы',
              icon: 'fa-solid fa-file-invoice',
              roles: ['user', 'member', 'chairman'],
            },
            path: 'documents',
            name: 'user-documents',
            component: markRaw(UserDocumentsPage),
          },
          {
            meta: {
              title: 'Общие собрания',
              icon: 'fa-solid fa-users-between-lines',
              roles: ['user', 'member', 'chairman'],
            },
            path: 'meets',
            name: 'user-meets',
            component: markRaw(ListOfMeetsPage),
          },
          {
            path: 'meets/:hash',
            name: 'user-meet-details',
            component: markRaw(MeetDetailsPage),
          },
          {
            path: '/:coopname/contacts',
            name: 'contacts',
            component: markRaw(ContactsPage),
            meta: {
              title: 'Контакты',
              icon: 'fa-solid fa-info',
              roles: [],
            },
          },
        ]
      }
    ]
  }
}
