import { markRaw } from 'vue'
import { MonitorPage } from './pages/MonitorPage'
import { SettingsPage } from './pages/SettingsPage'
import { LogsPage } from './pages/LogsPage'
import { agreementsBase } from 'src/shared/lib/consts/workspaces'
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace'

export default async function (): Promise<IWorkspaceConfig[]> {
  return [{
    workspace: 'powerup',
    extension_name: 'powerup',
    title: 'Стол вычислительных ресурсов',
    icon: 'fa-solid fa-server',
    defaultRoute: 'monitor', // Маршрут по умолчанию для рабочего стола
    routes: [
      {
        meta: {
          title: 'Стол вычислительных ресурсов',
          icon: 'fa-solid fa-server',
          roles: ['chairman', 'member'],
        },
        path: '/:coopname/powerup',
        name: 'powerup',
        children: [
          {
            path: 'monitor',
            name: 'monitor',
            component: markRaw(MonitorPage),
            meta: {
              title: 'Монитор ресурсов',
              icon: 'fa-solid fa-chart-line',
              roles: ['chairman', 'member'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
          },
          {
            path: 'settings',
            name: 'powerup-settings',
            component: markRaw(SettingsPage),
            meta: {
              title: 'Настройки аренды',
              icon: 'fa-solid fa-cogs',
              roles: ['chairman'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
          },
          {
            path: 'logs',
            name: 'powerup-logs',
            component: markRaw(LogsPage),
            meta: {
              title: 'Лог аренды',
              icon: 'fa-solid fa-list',
              roles: ['chairman', 'member'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
          },
        ],
      },
    ],
  }]
}
