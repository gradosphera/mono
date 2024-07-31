import { UserIdentityPage } from 'src/pages/User/IdentityPage';
import { UserPaymentMethodsPage } from 'src/pages/User/PaymentMethodsPage';
import { UserWalletPage } from 'src/pages/User/WalletPage';
import decisions from 'src/components/soviet/decisions.vue';
import participants from 'src/components/soviet/participants.vue';
import documents from 'src/components/soviet/documents.vue';
import { markRaw } from 'vue';
// import { Commutator } from 'src/widgets/Commutator';

// import { MainMarketplacePage } from 'src/pages/marketplace/MainPage';
// import { ModerationPage } from 'src/pages/marketplace/Moderation';
// import { CreateParentOfferPage } from 'src/pages/marketplace/CreateParentOffer';
// import { ShowcasePage } from 'src/pages/marketplace/Showcase';
// import { UserParentOffersPage } from 'src/pages/marketplace/UserParentOffers';
// import { SuppliesListPage } from 'src/pages/marketplace/SuppliesList';
// import { UserSuppliesListPage } from 'src/pages/marketplace/UserSuppliesList';
import { ContactsPage } from 'src/pages/Contacts';
import { CooperativeDetails } from 'src/widgets/Cooperative/Details';
import { CooperativeMembers } from 'src/widgets/Cooperative/Members';
import { ChangeCooperativeContributions } from 'src/widgets/Cooperative/Contributions';
import { ChangeCooperativeContacts } from 'src/widgets/Cooperative/Contacts';

export const manifest = {
  'name': 'UserDesktop',
  'hash': 'hash1',
  'authorizedHome': 'user-identity',
  'nonAuthorizedHome': 'signin',
  'routes': [
    {
      meta: {
        title: 'Пайщик',
        icon: 'fa-solid fa-id-card',
        roles: [],
      },
      path: '/:coopname/user',
      name: 'home',
      // component: markRaw(UserHomePage),
      children: [{
        meta: {
          title: 'Удостоверение',
          icon: '',
          roles: [],
        },
        path: 'identity',
        name: 'user-identity',
        component: markRaw(UserIdentityPage),
        children: [],
        },{
          meta: {
            title: 'Кошелёк',
            icon: '',
            roles: [],
          },
          path: 'wallet',
          name: 'user-wallet',
          component: markRaw(UserWalletPage),
          children: [],
        },
        {
          meta: {
            title: 'Реквизиты',
            icon: '',
            roles: [],
          },
          path: 'payment-methods',
          name: 'user-payment-methods',
          component: markRaw(UserPaymentMethodsPage),
          children: [],
        }
      ],
    },

    {
      meta: {
        title: 'Совет',
        icon: 'fa-regular fa-circle',
        roles: ['chairman', 'member'],
      },
      path: '/:coopname/soviet',
      name: 'soviet',
      children: [
        {
          path: 'agenda',
          name: 'agenda',
          component: markRaw(decisions),
          meta: {
            title: 'Повестка',
            icon: 'fa-solid fa-check-to-slot',
            roles: [],
          },
        },
        {
          path: 'participants',
          name: 'participants',
          component: markRaw(participants),
          meta: {
            title: 'Пайщики',
            icon: 'fa-solid fa-users',
            roles: ['chairman', 'member'],
          },
        },
        {
          path: 'documents',
          name: 'documents',
          component: markRaw(documents),
          meta: {
            title: 'Документы',
            icon: 'fa-solid fa-file-invoice',
            roles: ['chairman', 'member'],
          },
        },

      ]
    },

    //КООПЕРАТИВ
    {
      meta: {
        title: 'Кооператив',
        icon: 'fa-solid fa-cog',
        roles: ['chairman', 'member'],
      },
      path: '/:coopname/settings',
      name: 'settings',
      children: [
        {
          path: 'details',
          name: 'settings-details',
          component: markRaw(CooperativeDetails),
          meta: {
            title: 'Реквизиты',
            icon: 'fa-solid fa-check-to-slot',
            roles: [],
          },
        },
        {
          path: 'members',
          name: 'settings-members',
          component: markRaw(CooperativeMembers),
          meta: {
            title: 'Члены Совета',
            icon: 'fa-solid fa-users',
            roles: ['chairman', 'member'],
          },
        },
        {
          path: 'contributions',
          name: 'settings-contributions',
          component: markRaw(ChangeCooperativeContributions),
          meta: {
            title: 'Взносы',
            icon: 'fa-solid fa-file-invoice',
            roles: ['chairman', 'member'],
          },
        },

        {
          path: 'contacts',
          name: 'settings-contacts',
          component: markRaw(ChangeCooperativeContacts),
          meta: {
            title: 'Контакты',
            icon: 'fa-solid fa-file-invoice',
            roles: ['chairman', 'member'],
          },
        },
      ]
    },

    //       //страница управления кооперативом


      // {
      //   meta: {
      //     title: 'Маркетплейс',
      //     icon: 'fa-solid fa-cog',
      //     roles: [],
      //   },
      //   path: '/:coopname/marketplace',
      //   name: 'marketplace',
      //   component: markRaw(MainMarketplacePage),
      //   children: [
      //     {
      //       path: 'moderation',
      //       name: 'marketplace-moderation',
      //       component: markRaw(ModerationPage),
      //       meta: {
      //         title: 'Модерация',
      //         icon: '',
      //         roles: ['member', 'chairman'],
      //       },
      //     },
      //     {
      //       path: 'create-offer',
      //       name: 'marketplace-create-offer',
      //       component: markRaw(CreateParentOfferPage),
      //       meta: {
      //         title: 'Создать объявление',
      //         icon: '',
      //         roles: [],
      //       },
      //     },
      //     {
      //       path: 'showcase',
      //       name: 'marketplace-showcase',
      //       component: markRaw(ShowcasePage),
      //       children: [
      //         {
      //           path: ':id',
      //           name: 'marketplace-showcase-id',
      //           component: markRaw(ShowcasePage),
      //         },
      //       ],
      //       meta: {
      //         title: 'Витрина',
      //         icon: '',
      //         roles: [],
      //       },
      //     },
      //     {
      //       path: 'user-offers',
      //       name: 'marketplace-user-offers',
      //       component: markRaw(UserParentOffersPage),
      //       children: [
      //         {
      //           path: ':id',
      //           name: 'marketplace-user-offer-id',
      //           component: markRaw(UserParentOffersPage),
      //         },
      //       ],
      //       meta: {
      //         title: 'Мои объявления',
      //         icon: '',
      //         roles: [],
      //       },
      //     },
      //     {
      //       path: 'supplies',
      //       name: 'marketplace-supplies',
      //       component: markRaw(SuppliesListPage),
      //       meta: {
      //         title: 'Все заказы',
      //         icon: '',
      //         roles: ['member', 'chairman'],
      //       },
      //     },
      //     {
      //       path: 'user-supplies',
      //       name: 'marketplace-user-supplies',
      //       component: markRaw(UserSuppliesListPage),
      //       meta: {
      //         title: 'Мои заказы',
      //         icon: '',
      //         roles: [],
      //       },
      //     },
      //   ],
      // },
      //страница контактов
      {
        path: ':coopname/contacts',
        name: 'contacts',
        component: markRaw(ContactsPage),
        meta: {
          title: 'Контакты',
          icon: 'fa-solid fa-info',
          roles: [],
        },
      },
      // {
      //   path: ':coopname/commutator',
      //   name: 'commutator',
      //   component: markRaw(Commutator),
      //   meta: {
      //     title: 'Коммутатор',
      //     icon: '',
      //     roles: [],
      //   },
      // },
  ],
  'config': {
    'layout': 'default',
    'theme': 'light'
  },
  'schemas': {
    'layout': 'avj schema here',
    'theme': 'avj schema here'
  }
}
