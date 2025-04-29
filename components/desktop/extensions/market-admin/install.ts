import { markRaw } from 'vue'
import { ModerationPage } from 'src/pages/Marketplace/Moderation'
import { SuppliesListPage } from 'src/pages/Marketplace/SuppliesList'

export default async function () {
  return {
    workspace: 'market-admin',
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
  }
}
