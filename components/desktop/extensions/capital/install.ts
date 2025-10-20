import { markRaw } from 'vue';
import { agreementsBase } from 'src/shared/lib/consts/workspaces';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';
import { ImportContributorsPage } from './pages';
import { ContributorsPage } from './pages';
import { CapitalBase } from './pages/CapitalBase';
import { ProjectsListPage } from './pages/ProjectsListPage';
import { ProjectPage } from './pages/ProjectPage';
import { ComponentPage } from './pages/ComponentPage';
import { IssuePage } from './pages/IssuePage';
import { TrackerPage } from './pages';
import { ProjectsVotingPage } from './pages';
import { ProjectsResultsPage } from './pages';
import { ProjectsInvitesPage } from './pages';
import { CapitalWalletPage, CapitalRegistrationPage, MasterCommitsPage } from './pages';
import { ProjectDescriptionPage } from './pages/ProjectDescriptionPage';
import { ProjectInviteViewerPage } from './pages';
import { ProjectInviteEditorPage } from './pages/ProjectInviteEditorPage';
import { ProjectPlanningPage } from './pages/ProjectPlanningPage';
import { ProjectAuthorsPage } from './pages/ProjectAuthorsPage';
import { ProjectContributorsPage } from './pages/ProjectContributorsPage';
import { ProjectComponentsPage } from './pages/ProjectComponentsPage';
import { ProjectRequirementsPage } from './pages/ProjectRequirementsPage';
import { ComponentDescriptionPage } from './pages/ComponentDescriptionPage';
import { ComponentInvitePage } from './pages/ComponentInvitePage';
import { ComponentPlanningPage } from './pages/ComponentPlanningPage';
import { ComponentAuthorsPage } from './pages/ComponentAuthorsPage';
import { ComponentContributorsPage } from './pages/ComponentContributorsPage';
import { ComponentTasksPage } from './pages/ComponentTasksPage';
import { ComponentRequirementsPage } from './pages/ComponentRequirementsPage';
import { registerCapitalDecisionHandlers } from './app/extensions';

export default async function (): Promise<IWorkspaceConfig[]> {
  // Регистрируем обработчики решений для расширения capital
  registerCapitalDecisionHandlers();
  return [{
    workspace: 'capital',
    extension_name: 'capital',
    title: 'Благорост',
    icon: 'fa-solid fa-seedling',
    defaultRoute: 'capital-wallet', // Маршрут по умолчанию для рабочего стола
    routes: [
      {
        meta: {
          title: 'Шаблон',
          icon: 'fa-solid fa-user-tie',
          roles: [],
        },
        path: '/:coopname/capital',
        name: 'capital',
        component: markRaw(CapitalBase),
        children: [
          {
            path: 'wallet',
            name: 'capital-wallet',
            component: markRaw(CapitalWalletPage),
            meta: {
              title: 'Профиль',
              icon: 'fa-solid fa-wallet',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
          {
            path: 'registration',
            name: 'capital-registration',
            component: markRaw(CapitalRegistrationPage),
            meta: {
              title: 'Регистрация',
              icon: 'fa-solid fa-user-plus',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: true,
            },
            children: [],
          },
          {
            path: 'projects',
            name: 'projects-list',
            component: markRaw(ProjectsListPage),
            meta: {
              title: 'Мастерская',
              icon: 'fa-solid fa-list',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: false,
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
            path: 'results',
            name: 'results',
            component: markRaw(ProjectsResultsPage),
            meta: {
              title: 'Результаты',
              icon: 'fa-solid fa-chart-line',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },
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
            path: 'projects-invites',
            name: 'projects-invites',
            component: markRaw(ProjectsInvitesPage),
            meta: {
              title: 'Объявления',
              icon: 'fa-solid fa-envelope-open-text',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
            },
            children: [],
          },


          {
            path: 'commits',
            name: 'commits-list',
            component: markRaw(MasterCommitsPage),
            meta: {
              title: 'Коммиты',
              icon: 'fa-solid fa-code-commit',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: false,
            },
            children: [],
          },
          {
            path: 'projects/:project_hash',
            name: 'project-base',
            component: markRaw(ProjectPage),
            meta: {
              title: 'Проект',
              icon: 'fa-solid fa-folder-tree',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: true,
            },
            children: [
              {
                name: 'project-base',
                path: '',
                redirect: { name: 'project-description' },
              },
              {
                path: 'description',
                name: 'project-description',
                component: markRaw(ProjectDescriptionPage),
                meta: {
                  title: 'Описание проекта',
                  icon: 'fa-solid fa-file-alt',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'invite',
                name: 'project-invite-editor',
                component: markRaw(ProjectInviteEditorPage),
                meta: {
                  title: 'Редактирование приглашения',
                  icon: 'fa-solid fa-envelope',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'planning',
                name: 'project-planning',
                component: markRaw(ProjectPlanningPage),
                meta: {
                  title: 'Финансирование проекта',
                  icon: 'fa-solid fa-chart-line',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'authors',
                name: 'project-authors',
                component: markRaw(ProjectAuthorsPage),
                meta: {
                  title: 'Соавторы проекта',
                  icon: 'fa-solid fa-users',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'contributors',
                name: 'project-contributors',
                component: markRaw(ProjectContributorsPage),
                meta: {
                  title: 'Вкладчики проекта',
                  icon: 'fa-solid fa-user-friends',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'components',
                name: 'project-components',
                component: markRaw(ProjectComponentsPage),
                meta: {
                  title: 'Компоненты проекта',
                  icon: 'fa-solid fa-folder-tree',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'requirements',
                name: 'project-requirements',
                component: markRaw(ProjectRequirementsPage),
                meta: {
                  title: 'Требования проекта',
                  icon: 'fa-solid fa-clipboard-list',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'invite',
                name: 'project-invite',
                component: markRaw(ProjectInviteViewerPage),
                meta: {
                  title: 'Приглашение в проект',
                  icon: 'fa-solid fa-envelope-open-text',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
                children: [],
              },
              {
                path: ':issue_hash',
                name: 'project-issue',
                component: markRaw(IssuePage),
                meta: {
                  title: 'Задача проекта',
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
          {
            path: 'components/:project_hash',
            name: 'component-base',
            component: markRaw(ComponentPage),
            meta: {
              title: 'Компонент',
              icon: 'fa-solid fa-folder-tree',
              roles: [],
              agreements: agreementsBase,
              requiresAuth: true,
              hidden: true,
            },
            children: [
              {
                name: 'component-base',
                path: '',
                redirect: { name: 'component-description' },
              },
              {
                path: 'description',
                name: 'component-description',
                component: markRaw(ComponentDescriptionPage),
                meta: {
                  title: 'Описание компонента',
                  icon: 'fa-solid fa-file-alt',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'invite',
                name: 'component-invite-editor',
                component: markRaw(ComponentInvitePage),
                meta: {
                  title: 'Редактирование приглашения',
                  icon: 'fa-solid fa-envelope',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'planning',
                name: 'component-planning',
                component: markRaw(ComponentPlanningPage),
                meta: {
                  title: 'Финансирование компонента',
                  icon: 'fa-solid fa-chart-line',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'authors',
                name: 'component-authors',
                component: markRaw(ComponentAuthorsPage),
                meta: {
                  title: 'Соавторы компонента',
                  icon: 'fa-solid fa-users',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'contributors',
                name: 'component-contributors',
                component: markRaw(ComponentContributorsPage),
                meta: {
                  title: 'Вкладчики компонента',
                  icon: 'fa-solid fa-user-friends',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'tasks',
                name: 'component-tasks',
                component: markRaw(ComponentTasksPage),
                meta: {
                  title: 'Задачи компонента',
                  icon: 'fa-solid fa-folder-tree',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: 'requirements',
                name: 'component-requirements',
                component: markRaw(ComponentRequirementsPage),
                meta: {
                  title: 'Требования компонента',
                  icon: 'fa-solid fa-clipboard-list',
                  roles: [],
                  agreements: agreementsBase,
                  requiresAuth: true,
                  hidden: true,
                },
              },
              {
                path: ':issue_hash',
                name: 'component-issue',
                component: markRaw(IssuePage),
                meta: {
                  title: 'Задача компонента',
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
      },
    ],
  }];
}
