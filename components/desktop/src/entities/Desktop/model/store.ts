import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { RouteRecordRaw, type RouteMeta, type Router } from 'vue-router';
import type {
  IBackNavigationButton,
  IDesktopWithNavigation,
} from './types';
import { api } from '../api';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';

interface WorkspaceMenuItem {
  workspaceName: string;
  title: string;
  icon: string;
  extensionName: string;
  mainRoute: RouteRecordRaw | null;
  meta: RouteMeta;
}

const namespace = 'desktops';
const STORAGE_KEY_WORKSPACE = 'monocoop-active-workspace';

// Вспомогательные функции для безопасного доступа к localStorage (SSR-safe)
function safeLocalStorageGetItem(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
}

function safeLocalStorageSetItem(key: string, value: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
  }
}

export const useDesktopStore = defineStore(namespace, () => {
  const currentDesktop = ref<IDesktopWithNavigation>();
  const isWorkspaceChanging = ref<boolean>(false);
  const leftDrawerOpen = ref<boolean>(true);

  async function loadDesktop(): Promise<void> {
    console.log('🏠 [DesktopStore] Loading desktop from API...');
    const newDesktop = await api.getDesktop();
    console.log('🏠 [DesktopStore] Desktop loaded from API:', {
      workspacesCount: newDesktop.workspaces?.length,
      workspaces: newDesktop.workspaces?.map(ws => ({ name: ws.name, title: ws.title }))
    });

    // Если уже есть расширения, мерджим маршруты
    if (currentDesktop.value && currentDesktop.value.workspaces) {
      newDesktop.workspaces.forEach((newWs) => {
        const oldWs = currentDesktop.value?.workspaces.find(
          (ws) => ws.name === newWs.name,
        );
        if (oldWs && (oldWs as any).routes) {
          console.log('🏠 [DesktopStore] Merging routes for workspace:', newWs.name);
          (newWs as any).routes = (oldWs as any).routes;
        }
      });
    }

    // Добавляем поле backNavigationButton если оно отсутствует
    currentDesktop.value = {
      ...newDesktop,
      backNavigationButton: currentDesktop.value?.backNavigationButton || null,
    };

    console.log('🏠 [DesktopStore] Desktop updated, active workspace:', activeWorkspaceName.value);
    // Сбрасываем состояние загрузки после загрузки рабочего стола
    isWorkspaceChanging.value = false;
  }


  function setRoutes(workspaceName: string, routes: RouteRecordRaw[]): void {
    if (!currentDesktop.value) {
      console.warn('🏠 [DesktopStore] Cannot set routes: no current desktop');
      return;
    }

    const ws = currentDesktop.value.workspaces.find(
      (w) => w.name === workspaceName,
    );

    if (ws) {
      console.log('🏠 [DesktopStore] Setting routes for workspace:', {
        workspaceName,
        routesCount: routes.length,
        routes: routes.map(r => ({ name: r.name, path: r.path, meta: r.meta }))
      });
      (ws as any).routes = routes;
    } else {
      console.warn('🏠 [DesktopStore] Workspace not found for setting routes:', workspaceName);
    }
  }

  const workspaceMenus = computed<WorkspaceMenuItem[]>(() => {
    if (!currentDesktop.value) return [];

    return currentDesktop.value.workspaces.map((ws) => {
      const routes: RouteRecordRaw[] = (ws as any).routes || [];
      const meta: RouteMeta =
        routes.length > 0 && routes[0].meta
          ? (routes[0].meta as RouteMeta)
          : { title: ws.title, icon: '', roles: [] };

      // Приоритет иконки: 1) из workspace (с бэкенда), 2) из meta маршрута
      const icon = (ws as any).icon || meta.icon || 'fa-solid fa-desktop';

      return {
        workspaceName: ws.name,
        title: ws.title,
        icon,
        extensionName: (ws as any).extension_name || 'unknown',
        mainRoute: routes.length > 0 ? routes[0] : null,
        meta,
      };
    });
  });

  // Храним название активного workspace
  const activeWorkspaceName = ref<string | null>(null);

  function selectWorkspace(name: string) {
    console.log('🏠 [DesktopStore] Selecting workspace:', name);
    isWorkspaceChanging.value = true;
    activeWorkspaceName.value = name;
    // Сохраняем выбранный рабочий стол в localStorage (SSR-safe)
    safeLocalStorageSetItem(STORAGE_KEY_WORKSPACE, name);
    console.log('🏠 [DesktopStore] Workspace selected, active now:', activeWorkspaceName.value);
  }

  // Функция для определения и выбора дефолтного рабочего стола
  function selectDefaultWorkspace(ignoreSaved = false) {
    // Сбрасываем состояние загрузки на случай если оно было установлено
    isWorkspaceChanging.value = false;

    // Проверяем, был ли ранее сохранен рабочий стол (SSR-safe)
    // Но игнорируем сохраненный выбор если передан флаг ignoreSaved (например, после логина)
    if (!ignoreSaved) {
      const savedWorkspace = safeLocalStorageGetItem(STORAGE_KEY_WORKSPACE);

      if (
        savedWorkspace &&
        currentDesktop.value?.workspaces.some((ws) => ws.name === savedWorkspace)
      ) {
        // Устанавливаем сохраненный рабочий стол без включения состояния загрузки (это инициализация)
        activeWorkspaceName.value = savedWorkspace;
        return;
      }
    }

    // Получаем настройки системы
    const systemStore = useSystemStore();
    const session = useSessionStore();

    let defaultWorkspace = 'participant'; // дефолтное значение

    // При первом входе председателя без сохранённого выбора отправляем на стол председателя
    if (session.isChairman) {
      const hasChairmanWorkspace = currentDesktop.value?.workspaces.some((ws) => ws.name === 'chairman');
      if (hasChairmanWorkspace) {
        activeWorkspaceName.value = 'chairman';
        safeLocalStorageSetItem(STORAGE_KEY_WORKSPACE, 'chairman');
        return;
      }
    }

    // Определяем, какие настройки использовать (авторизованный или неавторизованный пользователь)
    if (session.isAuth) {
      // Для авторизованных пользователей используем authorized_default_workspace
      defaultWorkspace = systemStore.info?.settings?.authorized_default_workspace || 'participant';
    } else {
      // Для неавторизованных пользователей используем non_authorized_default_workspace
      defaultWorkspace = systemStore.info?.settings?.non_authorized_default_workspace || 'participant';
    }

    // Проверяем, что выбранный рабочий стол доступен
    const isWorkspaceAvailable = currentDesktop.value?.workspaces.some((ws) => ws.name === defaultWorkspace);

    if (isWorkspaceAvailable) {
      activeWorkspaceName.value = defaultWorkspace;
      safeLocalStorageSetItem(STORAGE_KEY_WORKSPACE, defaultWorkspace);
    } else {
      // Если настроенный рабочий стол недоступен, используем participant
      activeWorkspaceName.value = 'participant';
      safeLocalStorageSetItem(STORAGE_KEY_WORKSPACE, 'participant');
    }
  }

  const activeSecondLevelRoutes = computed((): RouteRecordRaw[] => {
    if (!activeWorkspaceName.value) {
      console.log('🏠 [DesktopStore] No active workspace name for second level routes');
      return [];
    }

    const ws = workspaceMenus.value.find(
      (menu) => menu.workspaceName === activeWorkspaceName.value,
    );

    const routes = ws && ws.mainRoute && ws.mainRoute.children
      ? (ws.mainRoute.children as RouteRecordRaw[])
      : [];

    console.log('🏠 [DesktopStore] Active second level routes computed:', {
      activeWorkspaceName: activeWorkspaceName.value,
      workspaceFound: !!ws,
      mainRouteExists: !!ws?.mainRoute,
      routesCount: routes.length,
      routes: routes.map(r => ({ name: r.name, path: r.path, meta: r.meta }))
    });

    return routes;
  });

  function registerWorkspaceMenus(router: Router): void {
    const baseRoute = router.getRoutes().find((r) => r.name === 'base');
    if (baseRoute) {
      workspaceMenus.value.forEach((menu) => {
        if (menu.mainRoute) {
          router.addRoute('base', menu.mainRoute as RouteRecordRaw);
        }
      });
    }
  }

  // Новый метод: удаляет workspace (расширение) из currentDesktop.workspaces по имени
  function removeWorkspace(workspaceName: string): void {
    if (currentDesktop.value && currentDesktop.value.workspaces) {
      currentDesktop.value.workspaces = currentDesktop.value.workspaces.filter(
        (ws) => ws.name !== workspaceName,
      );
    }
  }

  // Методы для управления навигацией
  function setBackNavigationButton(button: IBackNavigationButton) {
    if (!currentDesktop.value) return;
    currentDesktop.value.backNavigationButton = button;
  }

  function removeBackNavigationButton(componentId: string) {
    if (!currentDesktop.value) return;
    if (
      currentDesktop.value.backNavigationButton?.componentId === componentId
    ) {
      currentDesktop.value.backNavigationButton = null;
    }
  }

  const backNavigationButton = computed(
    () => currentDesktop.value?.backNavigationButton,
  );

  // Функция для управления состоянием загрузки
  function setWorkspaceChanging(value: boolean) {
    isWorkspaceChanging.value = value;
  }

  // Методы для управления левым drawer
  function toggleLeftDrawer() {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  }

  function setLeftDrawerOpen(value: boolean) {
    leftDrawerOpen.value = value;
  }

  function closeLeftDrawerOnMobile() {
    // Проверяем, является ли устройство мобильным
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      leftDrawerOpen.value = false;
    }
  }

  // Новый метод: получить данные маршрута по умолчанию без выполнения перехода
  function getDefaultPageRoute(): {
    name: string;
    params: Record<string, any>;
  } | null {
    const { info } = useSystemStore();
    const session = useSessionStore();

    if (!currentDesktop.value || !activeWorkspaceName.value) {
      return null;
    }

    // Найти текущий рабочий стол
    const currentWorkspace = currentDesktop.value.workspaces.find(
      (ws) => ws.name === activeWorkspaceName.value,
    );

    if (!currentWorkspace) {
      return null;
    }

    // Проверяем, есть ли настроенный маршрут для текущего рабочего стола
    let configuredRoute: string | undefined;

    if (session.isAuth) {
      // Для авторизованных пользователей используем authorized_default_route
      configuredRoute = info?.settings?.authorized_default_route;
    } else {
      // Для неавторизованных пользователей используем non_authorized_default_route
      configuredRoute = info?.settings?.non_authorized_default_route;
    }

    // Если настроенный маршрут существует, используем его
    if (configuredRoute) {
      // Глобальные маршруты (не принадлежащие конкретному workspace)
      const globalRoutes = ['signin', 'signup', 'lostkey', 'resetkey', 'invite'];
      if (globalRoutes.includes(configuredRoute)) {
        return {
          name: configuredRoute,
          params: { coopname: info.coopname },
        };
      }

      // Проверяем, что маршрут принадлежит текущему рабочему столу
      const ws = workspaceMenus.value.find(
        (menu) => menu.workspaceName === activeWorkspaceName.value,
      );
      if (
        ws &&
        ws.mainRoute &&
        ws.mainRoute.children &&
        ws.mainRoute.children.some((child: any) => child.name === configuredRoute)
      ) {
        return {
          name: configuredRoute,
          params: { coopname: info.coopname },
        };
      }
    }

    // Если нет настроенного маршрута или он не найден, используем defaultRoute рабочего стола
    if ((currentWorkspace as any).defaultRoute) {
      return {
        name: (currentWorkspace as any).defaultRoute,
        params: { coopname: info.coopname },
      };
    }

    // Если нет defaultRoute, ищем первый маршрут в детях основного маршрута
    const ws = workspaceMenus.value.find(
      (menu) => menu.workspaceName === activeWorkspaceName.value,
    );
    if (
      ws &&
      ws.mainRoute &&
      ws.mainRoute.children &&
      ws.mainRoute.children.length > 0
    ) {
      const firstChild = ws.mainRoute.children[0];
      return {
        name: firstChild.name as string,
        params: { coopname: info.coopname },
      };
    }

    return null;
  }

  // Новый метод: перейти на маршрут по умолчанию для текущего рабочего стола
  function goToDefaultPage(router: Router): void {
    // Используем новую функцию для получения данных маршрута
    const defaultPageRoute = getDefaultPageRoute();

    if (defaultPageRoute) {
      // Если маршрут найден, выполняем переход
      router.push(defaultPageRoute);
      // Устанавливаем небольшую задержку для плавного перехода
      setTimeout(() => {
        isWorkspaceChanging.value = false;
      }, 500);
    } else {
      // Если маршрут не найден, просто сбрасываем состояние загрузки
      isWorkspaceChanging.value = false;
    }
  }

  return {
    currentDesktop,
    isWorkspaceChanging,
    leftDrawerOpen,
    loadDesktop,
    setRoutes,
    workspaceMenus,
    activeWorkspaceName,
    selectWorkspace,
    selectDefaultWorkspace,
    activeSecondLevelRoutes,
    registerWorkspaceMenus,
    removeWorkspace,
    getDefaultPageRoute,
    goToDefaultPage,
    setWorkspaceChanging,
    toggleLeftDrawer,
    setLeftDrawerOpen,
    closeLeftDrawerOnMobile,
    // Новые методы
    setBackNavigationButton,
    removeBackNavigationButton,
    backNavigationButton,
  };
});
