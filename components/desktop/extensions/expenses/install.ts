import { markRaw } from 'vue';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';
import {
  ExpensesRegistryPage,
  ExpenseDetailPage,
  ExpensesAdminApprovePage,
  ExpensesAdminAuthorizePage,
  CashierPage,
  MyAdvancesPage,
} from './pages';

// Шасси расходов — UI scaffold (C28-32).
// Расширение НЕ зарегистрировано в src/processes/init-installed-extensions/extensions-registry.ts
// до закрытия C28-31 (backend GraphQL + SDK Zeus typings). См. README.md.
export default async function (): Promise<IWorkspaceConfig[]> {
  return [{
    workspace: 'expenses',
    extension_name: 'expenses',
    title: 'Расходы',
    icon: 'receipt_long',
    defaultRoute: 'expenses-registry',
    routes: [
      {
        meta: {
          title: 'Расходы',
          icon: 'receipt_long',
          roles: [],
        },
        path: '/:coopname/expenses',
        name: 'expenses',
        children: [
          {
            path: '',
            name: 'expenses-registry',
            component: markRaw(ExpensesRegistryPage),
            meta: {
              title: 'Реестр расходов',
              icon: 'receipt_long',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'admin/approve',
            name: 'expenses-admin-approve',
            component: markRaw(ExpensesAdminApprovePage),
            meta: {
              title: 'На одобрение председателя',
              icon: 'gavel',
              roles: ['chairman'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'admin/authorize',
            name: 'expenses-admin-authorize',
            component: markRaw(ExpensesAdminAuthorizePage),
            meta: {
              title: 'На авторизацию совета',
              icon: 'how_to_vote',
              roles: ['chairman'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'cashier',
            name: 'expenses-cashier',
            component: markRaw(CashierPage),
            meta: {
              title: 'Касса',
              icon: 'payments',
              roles: ['chairman'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'my/advances',
            name: 'expenses-my-advances',
            component: markRaw(MyAdvancesPage),
            meta: {
              title: 'Мои авансы',
              icon: 'account_balance_wallet',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: ':hash',
            name: 'expenses-detail',
            component: markRaw(ExpenseDetailPage),
            meta: {
              title: 'Расход',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: true,
            },
            children: [],
          },
        ],
      },
    ],
  }];
}
