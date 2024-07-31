import { UserHomePage } from 'src/pages/UserHome';

export const manifest = {
  'name': 'ChairmanDesktop',
  'hash': 'hash2',
  'authorizedHome': 'home',
  'nonAuthorizedHome': 'signup',
  'routes': [
    {
      path: '/:coopname/home',
      name: 'home',
      component: UserHomePage,
      children: [],
      meta: {
        is_desktop_menu: true,
        title: 'Профиль',
        icon: 'fa-solid fa-id-card',
        roles: [],
      },
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
