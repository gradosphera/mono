import layout from 'src/pages/_layouts/default.vue';
import index from 'src/pages/index.vue';
import blank from 'src/pages/blank/blank.vue';
import permissionDenied from 'src/pages/_layouts/permissionDenied.vue';

// import sovietPage from 'src/components/soviet/index.vue'
// import { CoopSettingsPage } from 'src/pages/CoopSettings';
import { WalletPage } from 'src/pages/wallet';
import { ModerationPage } from 'src/pages/marketplace/Moderation';
import { CreateParentOfferPage } from 'src/pages/marketplace/CreateParentOffer';
import { ShowcasePage } from 'src/pages/marketplace/Showcase';
import { SuppliesListPage } from 'src/pages/marketplace/SuppliesList';
import { UserParentOffersPage } from 'src/pages/marketplace/UserParentOffers';
import { UserSuppliesListPage } from 'src/pages/marketplace/UserSuppliesList';
import { MainMarketplacePage } from 'src/pages/marketplace/MainPage';
import { SignUpPage } from 'src/pages/SignUp';
import { SignInPage } from 'src/pages/SignIn';
import { RouteRecordRaw } from 'vue-router';
import decisions from 'src/components/soviet/decisions.vue';
import participants from 'src/components/soviet/participants.vue';
import documents from 'src/components/soviet/documents.vue';
import { ContactsPage } from 'src/pages/Contacts';

const baseRoutes = [
  {
    path: '/',
    component: layout,
    children: [
      {
        path: '',
        name: 'index',
        component: index,
      },

      //страница кошелька пользователя
      {
        path: '/:coopname/wallet',
        name: 'wallet',
        component: WalletPage,
        children: [],
        meta: {
          is_desktop_menu: true,
          title: 'Кошелек',
          icon: 'fa-solid fa-id-card',
          roles: [],
        },
      },


      //страница управления кооперативом
      // {
      //   path: ':coopname/settings',
      //   name: 'soviet',
      //   component: CoopSettingsPage,
      //   meta: {
      //     is_desktop_menu: true,
      //     title: 'Настройки',
      //     icon: 'fa-solid fa-cog',
      //     roles: ['admin'],
      //   },
      // },
      {
        path: ':coopname/agenda',
        name: 'agenda',
        component: decisions,
        meta: {
          is_desktop_menu: true,
          title: 'Повестка',
          icon: 'fa-solid fa-check-to-slot',
          roles: ['admin'],
        },
      },
      {
        path: ':coopname/participants',
        name: 'participants',
        component: participants,
        meta: {
          is_desktop_menu: true,
          title: 'Пайщики',
          icon: 'fa-solid fa-users',
          roles: ['admin'],
        },
      },
      {
        path: ':coopname/documents',
        name: 'documents',
        component: documents,
        meta: {
          is_desktop_menu: true,
          title: 'Документы',
          icon: 'fa-solid fa-file-invoice',
          roles: ['admin'],
        },
      },
      {
        path: ':coopname/auth/signin',
        name: 'signin',
        component: SignInPage,
        children: [],
      },
      {
        path: ':coopname/auth/signup',
        name: 'signup',
        component: SignUpPage,
        children: [],
      },

      {
        path: '/:coopname/marketplace',
        name: 'marketplace',
        component: MainMarketplacePage,
        children: [
          {
            path: 'moderation',
            name: 'marketplace-moderation',
            component: ModerationPage,
          },
          {
            path: 'create-offer',
            name: 'marketplace-create-offer',
            component: CreateParentOfferPage,
          },
          {
            path: 'showcase',
            name: 'marketplace-showcase',
            component: ShowcasePage,
            children: [
              {
                path: ':id',
                name: 'marketplace-showcase-id',
                component: ShowcasePage,
              },
            ],
          },
          {
            path: 'user-offers',
            name: 'marketplace-user-offers',
            component: UserParentOffersPage,
            children: [
              {
                path: ':id',
                name: 'marketplace-user-offer-id',
                component: UserParentOffersPage,
              },
            ],
          },
          {
            path: 'supplies',
            name: 'marketplace-supplies',
            component: SuppliesListPage,
          },
          {
            path: 'user-supplies',
            name: 'marketplace-user-supplies',
            component: UserSuppliesListPage,
          },
        ],
      },
      //страница контактов
      {
        path: ':coopname/contacts',
        name: 'contacts',
        component: ContactsPage,
        meta: {
          is_desktop_menu: true,
          title: 'Контакты',
          icon: 'fa-solid fa-info',
          roles: [],
        },
      },
      {
        path: '/something-bad',
        name: 'somethingBad',
        component: blank,
      },
      {
        path: '/permission-denied',
        name: 'permissionDenied',
        component: permissionDenied,
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: blank,
      },
    ],
  },
];

const rs = baseRoutes;

export const routes = rs as RouteRecordRaw[];
