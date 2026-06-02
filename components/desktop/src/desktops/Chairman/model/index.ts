import { UserPaymentMethodsPage } from 'src/pages/User/PaymentMethodsPage';
import { NotificationsJournalPage } from 'src/pages/Chairman/NotificationsJournalPage';
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
        title: 'Журнал уведомлений',
        icon: 'notifications',
        roles: ['chairman'],
      },
      path: '/:coopname/notifications-journal',
      name: 'chairman-notifications-journal',
      component: markRaw(NotificationsJournalPage),
      children: [],
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
