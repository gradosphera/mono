import { markRaw } from 'vue'
import Page from './src/Powerup.vue'

export default async function () {
  return {
    workspace: 'powerup',
    routes: [
      {
        path: '/powerup',
        name: 'powerup',
        component: markRaw(Page),
        meta: {
          title: 'Power Up',
          icon: 'fa-bolt',
          roles: []
        }
      }
    ]
  }
}
