import { markRaw } from 'vue'
import Page from './src/Powerup.vue'
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace'

export default async function (): Promise<IWorkspaceConfig[]> {
  return [{
    workspace: 'powerup',
    extension_name: 'powerup',
    title: 'Powerup',
    icon: 'fa-solid fa-bolt',
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
  }]
}
