import { markRaw } from 'vue';
import { CoopgramPage } from './pages/CoopgramPage';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';

export default async function (): Promise<IWorkspaceConfig[]> {
  return [{
    workspace: 'coopgram',
    extension_name: 'coopgram',
    title: 'Коопграм',
    icon: 'fa-solid fa-comments',
    defaultRoute: 'chat', // Маршрут по умолчанию для рабочего стола чата
    routes: [
      {
        meta: {
          title: 'Кооперативный мессенджер',
          icon: 'fa-solid fa-comments',
          roles: ['user', 'chairman', 'member'],
        },
        path: '/:coopname/coopgram',
        name: 'coopgram',
        component: markRaw(CoopgramPage),
        children: [
          {
            path: 'chat',
            name: 'coopgram-chat',
            component: markRaw(CoopgramPage),
            meta: {
              title: 'Кооперативный мессенджер',
              icon: 'fa-solid fa-comments',
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
