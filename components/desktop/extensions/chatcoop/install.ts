import { markRaw } from 'vue';
import { ChatCoopPage, MobileClientPage } from './pages';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';

export default async function (): Promise<IWorkspaceConfig[]> {
  return [{
    workspace: 'chatcoop',
    extension_name: 'chatcoop',
    title: 'Кооперативный мессенджер',
    icon: 'fa-solid fa-comments',
    defaultRoute: 'chat', // Маршрут по умолчанию для рабочего стола чата
    routes: [
      {
        meta: {
          title: 'Кооперативный мессенджер',
          icon: 'fa-solid fa-comments',
          roles: ['user', 'chairman', 'member'],
        },
        path: '/:coopname/chatcoop',
        name: 'chatcoop',
        children: [
          {
            path: 'chat',
            name: 'chatcoop-chat',
            component: markRaw(ChatCoopPage),
            meta: {
              title: 'Быстрый клиент',
              icon: 'fa-solid fa-comments',
              roles: ['user', 'chairman', 'member'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'mobile',
            name: 'chatcoop-mobile',
            component: markRaw(MobileClientPage),
            meta: {
              title: 'Мобильный клиент',
              icon: 'fa-solid fa-mobile-alt',
              roles: ['user', 'chairman', 'member'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
        ],
      },
    ],
  }];
}
