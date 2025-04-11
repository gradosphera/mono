import { markRaw } from 'vue'
import { ShowcasePage } from 'src/pages/Marketplace/Showcase'
import { CreateParentOfferPage } from 'src/pages/Marketplace/CreateParentOffer'
import { UserParentOffersPage } from 'src/pages/Marketplace/UserParentOffers'
import { UserSuppliesListPage } from 'src/pages/Marketplace/UserSuppliesList'

export default async function () {
  return {
    workspace: 'market',
    routes: [
      {
        meta: {
          title: 'Стол заказов',
          icon: 'fa-solid fa-shop',
          roles: [],
        },
        path: '/:coopname/market',
        name: 'market',
        children: [
          {
            path: 'showcase',
            name: 'marketplace-showcase',
            component: markRaw(ShowcasePage),
            children: [
              {
                path: ':id',
                name: 'marketplace-showcase-id',
                component: markRaw(ShowcasePage),
              },
            ],
            meta: {
              title: 'Витрина',
              icon: '',
              roles: [],
            },
          },
          {
            path: 'create-offer',
            name: 'marketplace-create-offer',
            component: markRaw(CreateParentOfferPage),
            meta: {
              title: 'Создать объявление',
              icon: '',
              roles: [],
            },
          },
          {
            path: 'user-offers',
            name: 'marketplace-user-offers',
            component: markRaw(UserParentOffersPage),
            children: [
              {
                path: ':id',
                name: 'marketplace-user-offer-id',
                component: markRaw(UserParentOffersPage),
              },
            ],
            meta: {
              title: 'Мои объявления',
              icon: '',
              roles: [],
            },
          },
          {
            path: 'user-supplies',
            name: 'marketplace-user-supplies',
            component: markRaw(UserSuppliesListPage),
            meta: {
              title: 'Мои заказы',
              icon: '',
              roles: [],
            },
          },
        ]
      }
    ]
  }
}
