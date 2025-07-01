import { markRaw } from 'vue';
import { ProfilePage } from 'src/pages/User/ProfilePage';
import { WalletPage } from 'src/pages/User/WalletPage';
import { ConnectionAgreementPage } from 'src/pages/Union/ConnectionAgreement';
import { UserPaymentMethodsPage } from 'src/pages/User/PaymentMethodsPage';
import { ContactsPage } from 'src/pages/Contacts';
import { ListOfMeetsPage } from 'src/pages/Cooperative/ListOfMeets';
import { MeetDetailsPage } from 'src/pages/Cooperative/MeetDetails';
import { UserDocumentsPage } from 'src/pages/User/DocumentsPage';
import { UserPaymentsPage } from 'src/pages/User/PaymentsPage';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';

export default async function (): Promise<IWorkspaceConfig> {
  return {
    workspace: 'participant',
    title: 'Стол пайщика',
    defaultRoute: 'wallet', // Маршрут по умолчанию для рабочего стола пайщика
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
              title: 'Кошелёк',
              icon: 'fa-solid fa-wallet',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            path: 'wallet',
            name: 'wallet',
            component: markRaw(WalletPage),
            children: [],
          },
          {
            meta: {
              title: 'Профиль',
              icon: 'fa-solid fa-user',
              roles: [],
              agreements: agreementsBase,
            },
            path: 'profile',
            name: 'profile',
            component: markRaw(ProfilePage),
            children: [],
          },
          {
            meta: {
              title: 'Подключение',
              icon: 'fas fa-link',
              roles: ['user'],
              conditions: 'isCoop === true && coopname === "voskhod"',
              requiresAuth: true,
            },
            path: '/:coopname/connect',
            name: 'connect',
            component: markRaw(ConnectionAgreementPage),
          },
          {
            meta: {
              title: 'Реквизиты',
              icon: 'fas fa-link',
              roles: ['user', 'member', 'chairman'],
              requiresAuth: true,
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
              requiresAuth: true,
            },
            path: 'documents',
            name: 'user-documents',
            component: markRaw(UserDocumentsPage),
          },
          {
            meta: {
              title: 'Платежи',
              icon: 'fa-solid fa-money-bill-transfer',
              roles: ['user', 'member', 'chairman'],
              requiresAuth: true,
            },
            path: 'payments',
            name: 'user-payments',
            component: markRaw(UserPaymentsPage),
          },
          {
            meta: {
              title: 'Собрания',
              icon: 'fa-solid fa-users-between-lines',
              roles: ['user', 'member', 'chairman'],
              requiresAuth: true,
            },
            path: 'meets',
            name: 'user-meets',
            component: markRaw(ListOfMeetsPage),
            children: [
              {
                path: ':hash',
                name: 'user-meet-details',
                component: markRaw(MeetDetailsPage),
                meta: {
                  title: 'Детали собрания',
                  icon: 'fa-solid fa-users-between-lines',
                  roles: ['user', 'member', 'chairman'],
                  requiresAuth: true,
                },
              },
            ],
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
        ],
      },
    ],
  };
}
