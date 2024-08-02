import { UserIdentityPage } from 'src/pages/User/IdentityPage';
import { UserPaymentMethodsPage } from 'src/pages/User/PaymentMethodsPage';
import { UserWalletPage } from 'src/pages/User/WalletPage';
import { markRaw } from 'vue';

export const manifest = {
  'name': 'ChairmanDesktop',
  'hash': 'hash2',
  'authorizedHome': 'home',
  'nonAuthorizedHome': 'signup',
  'routes': [
    {
      meta: {
        title: 'Пайщик',
        icon: 'fa-solid fa-id-card',
        roles: [],
      },
      path: '/:coopname/user',
      name: 'home',
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
