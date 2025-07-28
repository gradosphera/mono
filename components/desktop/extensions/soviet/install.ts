import { markRaw } from 'vue';
import { ListOfAgendaQuestions } from 'src/pages/Cooperative/ListOfAgenda';
import { ListOfParticipantsPage } from 'src/pages/Cooperative/ListOfParticipants';
import { ListOfDocumentsPage } from 'src/pages/Cooperative/ListOfDocuments';
import { PaymentsPage } from 'src/pages/Cooperative/Payments';
import { ListOfMeetsPage } from 'src/pages/Cooperative/ListOfMeets';
import { MeetDetailsPage } from 'src/pages/Cooperative/MeetDetails';
import { ListOfLedgerAccountsPage } from 'src/pages/Cooperative/ListOfLedgerAccounts';
import { UnionPageListOfCooperatives } from 'src/pages/Union/ListOfCooperatives';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';

export default async function (): Promise<IWorkspaceConfig> {
  return {
    workspace: 'soviet',
    title: 'Стол совета',
    defaultRoute: 'agenda', // Маршрут по умолчанию для рабочего стола совета
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
              title: 'Повестка совета',
              icon: 'fa-solid fa-check-to-slot',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'participants',
            name: 'participants',
            component: markRaw(ListOfParticipantsPage),
            meta: {
              title: 'Реестр пайщиков',
              icon: 'fa-solid fa-users',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'documents',
            name: 'documents',
            component: markRaw(ListOfDocumentsPage),
            meta: {
              title: 'Реестр документов',
              icon: 'fa-solid fa-file-invoice',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'payments/:username?',
            name: 'payments',
            component: markRaw(PaymentsPage),
            meta: {
              title: 'Реестр платежей',
              icon: 'fa-solid fa-file-invoice',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'meets',
            name: 'meets',
            component: markRaw(ListOfMeetsPage),
            meta: {
              title: 'Реестр собраний',
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
          {
            path: 'ledger',
            name: 'ledger',
            component: markRaw(ListOfLedgerAccountsPage),
            meta: {
              title: 'Реестр счетов',
              icon: 'fa-solid fa-chart-line',
              roles: ['chairman', 'member'],
            },
          },
          {
            path: 'union/cooperatives',
            name: 'union-cooperatives',
            component: markRaw(UnionPageListOfCooperatives),
            meta: {
              title: 'Реестр кооперативов',
              icon: 'fa-solid fa-handshake',
              roles: ['chairman', 'member'],
              conditions: 'coopname === "voskhod"',
              requiresAuth: true,
            },
          },
        ],
      },
    ],
  };
}
