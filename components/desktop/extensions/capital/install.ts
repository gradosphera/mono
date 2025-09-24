import { markRaw } from 'vue';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';
import { ImportContributorsPage } from './pages';
import { ContributorsPage } from './pages';
import { ConfigPage } from './pages/ConfigPage';
import { CapitalBase } from './pages/CapitalBase';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectPage } from './pages/ProjectPage';
import { ComponentPage } from './pages/ComponentPage';
import { IssuePage } from './pages/IssuePage';
import { TrackerPage } from './pages';
import { ProjectsVotingPage } from './pages';
import { ProjectsInvitesPage } from './pages';
import { CapitalWalletPage } from './pages';

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
        component: markRaw(CapitalBase),
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
            path: 'contributors',
            name: 'contributors',
            component: markRaw(ContributorsPage),
            meta: {
              title: 'Вкладчики',
              icon: 'fa-solid fa-users',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'wallet',
            name: 'capital-wallet',
            component: markRaw(CapitalWalletPage),
            meta: {
              title: 'Кошелек',
              icon: 'fa-solid fa-wallet',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'tracker',
            name: 'tracker',
            component: markRaw(TrackerPage),
            meta: {
              title: 'Трекер',
              icon: 'fa-solid fa-clock',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'projects-invites',
            name: 'projects-invites',
            component: markRaw(ProjectsInvitesPage),
            meta: {
              title: 'Инвайты проектов',
              icon: 'fa-solid fa-envelope-open-text',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'voting',
            name: 'voting',
            component: markRaw(ProjectsVotingPage),
            meta: {
              title: 'Голосования',
              icon: 'fa-solid fa-vote-yea',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'projects',
            name: 'projects-list',
            component: markRaw(ProjectsListPage),
            meta: {
              title: 'Список проектов',
              icon: 'fa-solid fa-list',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: false,
            },
            children: [],
          },
          {
            path: 'projects/:project_hash/components',
            name: 'project-components',
            component: markRaw(ProjectPage),
            meta: {
              title: 'Компоненты проекта',
              icon: 'fa-solid fa-folder-tree',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: true,
            },
            children: [],
          },
          {
            path: 'projects/:project_hash/tasks',
            name: 'project-tasks',
            component: markRaw(ComponentPage),
            meta: {
              title: 'Задачи проекта',
              icon: 'fa-solid fa-tasks',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: true,
            },
            children: [],
          },
          {
            path: 'projects/:project_hash/tasks/:issue_hash',
            name: 'project-issue',
            component: markRaw(IssuePage),
            meta: {
              title: 'Задача',
              icon: 'fa-solid fa-task',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: true,
            },
            children: [],
          },

        ],
      },
    ],
  };
}
