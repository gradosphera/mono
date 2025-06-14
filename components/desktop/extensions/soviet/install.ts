import { markRaw } from 'vue'
import { ListOfAgendaQuestions } from 'src/pages/Cooperative/ListOfAgenda'
import { ListOfParticipantsPage } from 'src/pages/Cooperative/ListOfParticipants'
import { ListOfDocumentsPage } from 'src/pages/Cooperative/ListOfDocuments'
import { PaymentsPage } from 'src/pages/Cooperative/Payments'
import { ListOfMeetsPage } from 'src/pages/Cooperative/ListOfMeets'
import { MeetDetailsPage } from 'src/pages/Cooperative/MeetDetails'
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace'

export default async function (): Promise<IWorkspaceConfig> {
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
            component: markRaw(ListOfAgendaQuestions),
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
            path: 'payments/:username?',
            name: 'payments',
            component: markRaw(PaymentsPage),
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
              title: 'Собрания',
              icon: 'fa-solid fa-users-between-lines',
              roles: ['chairman', 'member'],
            },
            children: [
              {
                path: ':hash',
                name: 'meet-details',
                component: markRaw(MeetDetailsPage),
              },
            ],
          },
        ]
      }
    ]
  }
}
