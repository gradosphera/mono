import layout from 'src/app/layouts/default.vue';
import widgetLayout from 'src/app/layouts/widget.vue';
import index from 'src/pages/index.vue';
import { BlankPage } from 'src/pages/Blank';
import { PermissionDenied } from 'src/pages/PermissionDenied';
import { SignUpPage } from 'src/pages/Registrator/SignUp';
import { SignInPage } from 'src/pages/Registrator/SignIn';
import { RouteRecordRaw } from 'vue-router';
import { InstallCooperativePage } from 'src/pages/Union/InstallCooperative';
import { LostKeyPage } from 'src/pages/Registrator/LostKey/ui';
import { ResetKeyPage } from 'src/pages/Registrator/ResetKey';
import { LoginRedirectPage } from 'src/features/User/LoginRedirect';
import { defineComponent, h } from 'vue';

// Dynamic layout wrapper, который определяет layout в runtime
const DynamicLayoutWrapper = defineComponent({
  name: 'DynamicLayoutWrapper',
  setup() {
    // Проверяем widget режим только на клиенте
    const isWidgetMode =
      typeof window !== 'undefined' &&
      (window.parent !== window ||
        new URLSearchParams(window.location.search).get('widget') === 'true');

    return () => {
      const LayoutComponent = isWidgetMode ? widgetLayout : layout;
      return h(LayoutComponent);
    };
  },
});

const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DynamicLayoutWrapper,
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
        meta: {
          title: 'Вход',
          icon: 'fa-solid fa-sign-in-alt',
          widget: {
            title: 'Вход',
            hideHeader: true,
            hideFooter: true,
          },
        },
      },
      {
        path: ':coopname/auth/lost-key',
        name: 'lostkey',
        component: LostKeyPage,
        children: [],
        meta: {
          title: 'Восстановление ключа',
          icon: 'fa-solid fa-key',
          widget: {
            title: 'Восстановление ключа',
            hideHeader: true,
          },
        },
      },
      {
        path: ':coopname/auth/reset-key',
        name: 'resetkey',
        component: ResetKeyPage,
        children: [],
        meta: {
          title: 'Сброс ключа',
          icon: 'fa-solid fa-key',
          widget: {
            title: 'Сброс ключа',
            hideHeader: true,
          },
        },
      },
      {
        path: ':coopname/auth/signup',
        name: 'signup',
        component: SignUpPage,
        children: [],
        meta: {
          title: 'Регистрация',
          icon: 'fa-solid fa-user-plus',
          widget: {
            title: 'Регистрация',
            hideHeader: true,
            hideFooter: true,
          },
        },
      },
      {
        path: ':coopname/auth/login-redirect',
        name: 'login-redirect',
        component: LoginRedirectPage,
        meta: {
          layout: 'default',
          title: 'Вход для доступа к содержимому',
          icon: 'fa-solid fa-lock',
          roles: [],
          widget: {
            title: 'Авторизация',
            hideHeader: false,
          },
        },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: BlankPage,
      },
    ],
  },
];

const rs = baseRoutes;

export { rs as routes };
