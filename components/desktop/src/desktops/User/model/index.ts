import { ListOfOrdersPage } from 'src/pages/Cooperative/ListOfOrders';
import { ListOfQuestionsWidget } from 'src/widgets/Cooperative/Agenda/ListOfQuestions';
import { markRaw } from 'vue';
import { ContactsPage } from 'src/pages/Cooperative/Contacts';
import { ListOfParticipantsPage } from 'src/pages/Cooperative/ListOfParticipants';
import { UnionPageListOfCooperatives } from 'src/pages/Union/ListOfCooperatives';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import { ConnectionPage } from 'src/pages/Union/Connection';
import { ListOfDocumentsPage } from 'src/pages/Documentor/ListOfDocuments';
import { CoopCardPage } from 'src/pages/User/CardPage';
// import { MainMarketplacePage } from 'src/pages/Marketplace/MainPage';
// import { ModerationPage } from 'src/pages/Marketplace/Moderation';
// import { CreateParentOfferPage } from 'src/pages/Marketplace/CreateParentOffer';
// import { ShowcasePage } from 'src/pages/Marketplace/Showcase';
// import { UserParentOffersPage } from 'src/pages/Marketplace/UserParentOffers';
// import { UserSuppliesListPage } from 'src/pages/Marketplace/UserSuppliesList';
// import { SuppliesListPage } from 'src/pages/Marketplace/SuppliesList';

export const manifest = {
  'name': 'UserDesktop',
  'hash': 'hash1',
  'authorizedHome': 'coop-card',
  'nonAuthorizedHome': 'signup',
  'routes': [
    {
      meta: {
        title: 'Централ',
        icon: 'fa-solid fa-id-card',
        roles: [],
      },
      path: '/:coopname/user',
      name: 'home',
      children: [
        {
          meta: {
            title: 'Подключение',
            icon: 'fas fa-link',
            roles: ['user'],
            conditions: 'isCoop === true && coopname === "voskhod"',
          },
          path: '/:coopname/connect',
          name: 'connect',
          component: markRaw(ConnectionPage),
        },
        {
          meta: {
            title: 'Карта пайщика',
            icon: '',
            roles: [],
            agreements: agreementsBase
          },
          path: 'coop-card',
          name: 'coop-card',
          component: markRaw(CoopCardPage),
          children: [],
        },
        // {
        // meta: {
        //   title: 'Удостоверение',
        //   icon: '',
        //   roles: [],
        //   agreements: agreementsBase
        // },
        // path: 'identity',
        // name: 'user-identity',
        // component: markRaw(UserIdentityPage),
        // children: [],
        // },{
        //   meta: {
        //     title: 'Кошелёк',
        //     icon: '',
        //     roles: [],
        //   },
        //   path: 'wallet',
        //   name: 'user-wallet',
        //   component: markRaw(UserWalletPage),
        //   children: [],
        // },
        {
          path: 'agenda',
          name: 'agenda',
          component: markRaw(ListOfQuestionsWidget),
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
        // {
        //   path: 'members',
        //   name: 'settings-members',
        //   component: markRaw(CooperativeMembers),
        //   meta: {
        //     title: 'Совет',
        //     icon: 'fa-solid fa-users',
        //     roles: ['chairman', 'member'],
        //   },
        // },
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
        // {
        //   path: 'details',
        //   name: 'settings-details',
        //   component: markRaw(CooperativeDetails),
        //   meta: {
        //     title: 'Реквизиты',
        //     icon: 'fa-solid fa-check-to-slot',
        //     roles: [],
        //   },
        // },

        // {
        //   path: 'contributions',
        //   name: 'settings-contributions',
        //   component: markRaw(ChangeCooperativeContributions),
        //   meta: {
        //     title: 'Взносы',
        //     icon: 'fa-solid fa-file-invoice',
        //     roles: ['chairman', 'member'],
        //   },
        // },
        {
          // meta: {
            // title: 'Подключения',
            // icon: 'fas fa-link',
            // roles: ['chairman', 'member'],
          // },
          path: '/:coopname/connections',
          name: 'connections',
          component: markRaw(UnionPageListOfCooperatives),

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
        // {
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
        // {
        //   meta: {
        //     title: 'Поддержка',
        //     icon: '',
        //     roles: [],
        //   },
        //   path: 'support',
        //   name: 'support',
        //   component: markRaw(SupportPage),
        //   children: [],
        // },
      ],
    },

    // {
    //   meta: {
    //     title: 'Совет',
    //     icon: 'fa-regular fa-circle',
    //     roles: ['chairman', 'member'],
    //   },
    //   path: '/:coopname/soviet',
    //   name: 'soviet',
    //   children: [

    //   ]
    // },

    //КООПЕРАТИВ
    // {
    //   meta: {
    //     title: 'Кооператив',
    //     icon: 'fa-solid fa-cog',
    //     roles: ['chairman', 'member'],
    //   },
    //   path: '/:coopname/settings',
    //   name: 'settings',
    //   children: [

    //   ]
    // },




      //страница контактов
      // {
      //   path: ':coopname/contacts',
      //   name: 'contacts',
      //   component: markRaw(ContactsPage),
      //   meta: {
      //     title: 'Контакты',
      //     icon: 'fa-solid fa-info',
      //     roles: [],
      //   },
      // },
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
