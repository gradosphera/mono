import { markRaw } from 'vue'
import { ModerationPage } from 'src/pages/Marketplace/Moderation'
import { SuppliesListPage } from 'src/pages/Marketplace/SuppliesList'
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace'

export default async function (): Promise<IWorkspaceConfig[]> {
  return [{
    workspace: 'market-admin',
    extension_name: 'market-admin',
    title: 'Стол администратора',
    icon: 'fa-solid fa-shop-lock',
    routes: [
      {
        meta: {
          title: 'Стол администратора',
          icon: 'fa-solid fa-shop-lock',
          roles: ['chairman', 'member'],
        },
        path: '/:coopname/market-admin',
        name: 'market-admin',
        children: [
          {
            path: 'moderation',
            name: 'marketplace-moderation',
            component: markRaw(ModerationPage),
            meta: {
              title: 'Модерация',
              icon: '',
              roles: ['member', 'chairman'],
            },
          },
          {
            path: 'supplies',
            name: 'marketplace-supplies',
            component: markRaw(SuppliesListPage),
            meta: {
              title: 'Все заказы',
              icon: '',
              roles: ['member', 'chairman'],
            },
          },
        ]
      }
    ]
  }]
}
