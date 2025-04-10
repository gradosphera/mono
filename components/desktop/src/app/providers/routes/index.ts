import layout from 'src/app/layouts/default.vue';
import index from 'src/pages/index.vue';
import { BlankPage } from 'src/pages/Blank';
import { PermissionDenied } from 'src/pages/PermissionDenied';
import { SignUpPage } from 'src/pages/Registrator/SignUp';
import { SignInPage } from 'src/pages/Registrator/SignIn';
import { RouteRecordRaw } from 'vue-router';
import { InstallCooperativePage } from 'src/pages/Union/InstallCooperative';
import { LostKeyPage } from 'src/pages/Registrator/LostKey/ui';
import { ResetKeyPage } from 'src/pages/Registrator/ResetKey';
import CooperativeSettingsPage from 'src/pages/Cooperative/SettingsPage/CooperativeSettingsPage.vue';
import { AccumulationFunds, ExpenseFunds } from 'src/widgets/Cooperative/Funds';
import { ChangeRegisterPaymentsPage } from 'src/pages/Cooperative/ChangeRegisterPayments';
import { ChangeCooperativeContacts } from 'src/pages/Cooperative/ChangeContacts';
import { MembersPage } from 'src/pages/Cooperative/MembersPage';
import { InstalledExtensions } from 'src/pages/ExtensionStore/InstalledExtensions';
import { ExtensionsShowcase } from 'src/pages/ExtensionStore/ExtensionsShowcase';
import { ExtensionPage } from 'src/pages/ExtensionStore/ExtensionPage';
import { MemberBranchList } from 'src/pages/Cooperative/MemberBranchList';


const baseRoutes = [
  {
    path: '/',
    component: layout,
    name: 'base',
    children: [
      {
        path: '',
        name: 'index',
        component: index,
      },
      {
        path: '/something-bad',
        name: 'somethingBad',
        component: BlankPage,
      },
      {
        path: '/permission-denied',
        name: 'permissionDenied',
        component: PermissionDenied,
      },
      {
        path: ':coopname/install',
        name: 'install',
        component: InstallCooperativePage,
        children: [],
      },
      {
        path: ':coopname/auth/signin',
        name: 'signin',
        component: SignInPage,
        children: [],
      },
      {
        path: ':coopname/auth/lost-key',
        name: 'lostkey',
        component: LostKeyPage,
        children: [],
      },
      {
        path: ':coopname/auth/reset-key',
        name: 'resetkey',
        component: ResetKeyPage,
        children: [],
      },
      {
        path: ':coopname/auth/signup',
        name: 'signup',
        component: SignUpPage,
        children: [],
      },
      {
        path: 'settings/cooperative',
        name: 'cooperative-settings',
        component: CooperativeSettingsPage,
        children: [
          {
            path: 'accumulation-funds',
            name: 'accumulation-funds',
            component: AccumulationFunds,
            children: [],
          },
          {
            path: 'branches',
            name: 'branches',
            component: MemberBranchList,
            children: [],
          },
          {
            path: 'expense-funds',
            name: 'expense-funds',
            component: ExpenseFunds,
            children: [],
          },
          {
            path: 'expense-funds',
            name: 'expense-funds',
            component: ExpenseFunds,
            children: [],
          },
          {
            path: 'initial-contributions',
            name: 'initial-contributions',
            component: ChangeRegisterPaymentsPage,
            children: [],
          },
          {
            path: 'change-contacts',
            name: 'change-contacts',
            component: ChangeCooperativeContacts,
            children: [],
          },
          {
            path: 'members',
            name: 'members',
            component: MembersPage,
            children: [],
          },
        ],
      },
      {
        path: 'extensions',
        name: 'extstore',
        children: [
          {
            path: 'showcase',
            name: 'extstore-showcase',
            component: ExtensionsShowcase,
            children: [],
          },
          {
            path: 'installed',
            name: 'appstore-installed',
            component: InstalledExtensions,
            children: [],
          },
          {
            path: 'extension/:name',
            name: 'one-extension',
            component: ExtensionPage,
            children: [
              {
                path: 'settings',
                name: 'extension-settings',
                component: ExtensionPage,
              },
              {
                path: 'install',
                name: 'extension-install',
                component: ExtensionPage,
              }
            ],
          },
        ],
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: BlankPage,
      },
    ],
  },
];

// const baseRoutes = [
//   {
//     path: '/',
//     component: layout,
//     children: [
//       {
//         path: '',
//         name: 'index',
//         component: index,
//       },

//       //страница кошелька пользователя
//       {
//         path: '/:coopname/home',
//         name: 'home',
//         component: UserHomePage,
//         children: [],
//         meta: {
//           is_desktop_menu: true,
//           title: 'Профиль',
//           icon: 'fa-solid fa-id-card',
//           roles: [],
//         },
//       },

//       //страница управления кооперативом
//       {
//         path: ':coopname/settings',
//         name: 'soviet',
//         component: CoopSettingsPage,
//         meta: {
//           is_desktop_menu: true,
//           title: 'Настройки',
//           icon: 'fa-solid fa-cog',
//           roles: ['chairman', 'member'],
//         },
//       },
//       {
//         path: ':coopname/agenda',
//         name: 'agenda',
//         component: decisions,
//         meta: {
//           is_desktop_menu: true,
//           title: 'Повестка',
//           icon: 'fa-solid fa-check-to-slot',
//           roles: ['chairman', 'member'],
//         },
//       },
//       {
//         path: ':coopname/participants',
//         name: 'participants',
//         component: participants,
//         meta: {
//           is_desktop_menu: true,
//           title: 'Пайщики',
//           icon: 'fa-solid fa-users',
//           roles: ['chairman', 'member'],
//         },
//       },
//       {
//         path: ':coopname/documents',
//         name: 'documents',
//         component: documents,
//         meta: {
//           is_desktop_menu: true,
//           title: 'Документы',
//           icon: 'fa-solid fa-file-invoice',
//           roles: ['chairman', 'member'],
//         },
//       },
//       {
//         path: ':coopname/auth/signin',
//         name: 'signin',
//         component: SignInPage,
//         children: [],
//       },
//       {
//         path: ':coopname/auth/signup',
//         name: 'signup',
//         component: SignUpPage,
//         children: [],
//       },


//       {
//         path: '/something-bad',
//         name: 'somethingBad',
//         component: BlankPage,
//       },
//       {
//         path: '/permission-denied',
//         name: 'permissionDenied',
//         component: PermissionDenied,
//       },
//       {
//         path: '/:pathMatch(.*)*',
//         name: 'NotFound',
//         component: BlankPage,
//       },
//     ],
//   },
// ];

const rs = baseRoutes;

export const routes = rs as RouteRecordRaw[];
