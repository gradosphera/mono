import { markRaw } from 'vue';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';
import { ImportContributorsPage } from './pages';
import { ConfigPage } from './pages/ConfigPage';
import { ProjectsBase } from './pages/ProjectsBase';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectTasksPage } from './pages/ProjectTasksPage';

export default async function (): Promise<IWorkspaceConfig> {
  return {
    workspace: 'capital',
    title: 'Контракт CAPITAL',
    defaultRoute: 'import-contributors', // Маршрут по умолчанию для рабочего стола председателя
    routes: [
      {
        meta: {
          title: 'Контракт CAPITAL',
          icon: 'fa-solid fa-user-tie',
          roles: ['chairman'],
        },
        path: '/:coopname/capital',
        name: 'capital',
        children: [
          {
            path: 'import-contributors',
            name: 'import-contributors',
            component: markRaw(ImportContributorsPage),
            meta: {
              title: 'Импорт вкладчиков',
              icon: 'fa-solid fa-puzzle-piece',
              roles: ['chairman'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'settings',
            name: 'capital-settings',
            component: markRaw(ConfigPage),
            meta: {
              title: 'Настройки',
              icon: 'fa-solid fa-users',
              roles: ['chairman'],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'projects',
            name: 'projects',
            component: markRaw(ProjectsBase),
            meta: {
              title: 'Проекты',
              icon: 'fa-solid fa-folder',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [
              {
                path: '',
                name: 'projects-list',
                component: markRaw(ProjectsPage),
                meta: {
                  title: 'Список проектов',
                  icon: 'fa-solid fa-list',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                },
                children: [],
              },
              {
                path: ':hash/tasks',
                name: 'project-tasks',
                component: markRaw(ProjectTasksPage),
                meta: {
                  title: 'Задачи проекта',
                  icon: 'fa-solid fa-tasks',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };
}
