import { markRaw } from 'vue';
import { ChatCoopPage, MobileClientPage, TranscriptionsPage, TranscriptionDetailPage } from './pages';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';

export default async function (): Promise<IWorkspaceConfig[]> {
  console.log('📨 [ChatCoop Install] Extension install function called');
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
          roles: ['chairman', 'member', 'user'],
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
              roles: ['chairman', 'member', 'user'],
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
              roles: ['chairman', 'member', 'user'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'transcriptions',
            name: 'chatcoop-transcriptions',
            component: markRaw(TranscriptionsPage),
            meta: {
              title: 'Транскрипции звонков',
              icon: 'fa-solid fa-file-lines',
              roles: ['chairman', 'member', 'user'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [
              {
                path: ':id',
                name: 'chatcoop-transcription-detail',
                component: markRaw(TranscriptionDetailPage),
                meta: {
                  title: 'Транскрипция',
                  icon: 'fa-solid fa-file-lines',
                  roles: ['chairman', 'member', 'user'],
                  agreements: agreementsBase,
                  requiresAuth: true,
                },
                children: [],
              }
            ],
          },

        ],
      },
    ],
  }];

}
