import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { RouteRecordRaw, type RouteMeta, type Router } from 'vue-router'
import type { IHealthResponse, IBackNavigationButton, IDesktopWithNavigation } from './types'
import { api } from '../api'

interface WorkspaceMenuItem {
  workspaceName: string
  title: string
  icon: string
  mainRoute: RouteRecordRaw | null
  meta: RouteMeta
}

const namespace = 'desktops'

export const useDesktopStore = defineStore(namespace, () => {
  const currentDesktop = ref<IDesktopWithNavigation>()
  const health = ref<IHealthResponse>()
  const online = ref<boolean>()

  async function loadDesktop(): Promise<void> {
    const newDesktop = await api.getDesktop();
    // Если уже есть расширения, мерджим маршруты
    if (currentDesktop.value && currentDesktop.value.workspaces) {
      newDesktop.workspaces.forEach(newWs => {
        const oldWs = currentDesktop.value?.workspaces.find(ws => ws.name === newWs.name);
        if (oldWs && (oldWs as any).routes) {
          (newWs as any).routes = (oldWs as any).routes;
        }
      });
    }
    // Добавляем поле backNavigationButton если оно отсутствует
    currentDesktop.value = {
      ...newDesktop,
      backNavigationButton: currentDesktop.value?.backNavigationButton || null
    };
  }

  async function healthCheck(): Promise<void> {
    try {
      health.value = await api.healthCheck();
      online.value = health.value.status !== 'maintenance';
      if (!online.value) setTimeout(healthCheck, 10000);
    } catch {
      online.value = false;
      setTimeout(healthCheck, 10000);
    }
  }

  function setRoutes(workspaceName: string, routes: RouteRecordRaw[]): void {
    if (!currentDesktop.value) return;
    const ws = currentDesktop.value.workspaces.find(w => w.name === workspaceName);
    if (ws) {
      (ws as any).routes = routes;
    }
  }

  const workspaceMenus = computed<WorkspaceMenuItem[]>(() => {
    if (!currentDesktop.value) return [];
    return currentDesktop.value.workspaces.map(ws => {
      const routes: RouteRecordRaw[] = (ws as any).routes || [];
      const meta: RouteMeta = routes.length > 0 && routes[0].meta
        ? routes[0].meta as RouteMeta
        : { title: ws.title, icon: '', roles: [] };
      return {
        workspaceName: ws.name,
        title: ws.title,
        icon: meta.icon,
        mainRoute: routes.length > 0 ? routes[0] : null,
        meta
      };
    });
  });

  // Храним название активного workspace
  const activeWorkspaceName = ref<string | null>(null);

  function selectWorkspace(name: string) {
    activeWorkspaceName.value = name;
  }

  const activeSecondLevelRoutes = computed((): RouteRecordRaw[] => {
    if (!activeWorkspaceName.value) return [];
    const ws = workspaceMenus.value.find(menu => menu.workspaceName === activeWorkspaceName.value);
    return ws && ws.mainRoute && ws.mainRoute.children
      ? ws.mainRoute.children as RouteRecordRaw[]
      : [];
  });

  function registerWorkspaceMenus(router: Router): void {
    const baseRoute = router.getRoutes().find(r => r.name === 'base');
    if (baseRoute) {
      workspaceMenus.value.forEach(menu => {
        if (menu.mainRoute) {
          router.addRoute('base', menu.mainRoute as RouteRecordRaw);
        }
      });
    }
  }

  // Новый метод: удаляет workspace (расширение) из currentDesktop.workspaces по имени
  function removeWorkspace(workspaceName: string): void {
    if (currentDesktop.value && currentDesktop.value.workspaces) {
      currentDesktop.value.workspaces = currentDesktop.value.workspaces.filter(ws => ws.name !== workspaceName);
    }
  }

  // Методы для управления навигацией
  function setBackNavigationButton(button: IBackNavigationButton) {
    if (!currentDesktop.value) return
    currentDesktop.value.backNavigationButton = button
  }

  function removeBackNavigationButton(componentId: string) {
    if (!currentDesktop.value) return
    if (currentDesktop.value.backNavigationButton?.componentId === componentId) {
      currentDesktop.value.backNavigationButton = null
    }
  }

  const backNavigationButton = computed(() => currentDesktop.value?.backNavigationButton)

  return {
    currentDesktop,
    health,
    online,
    loadDesktop,
    healthCheck,
    setRoutes,
    workspaceMenus,
    activeWorkspaceName,
    selectWorkspace,
    activeSecondLevelRoutes,
    registerWorkspaceMenus,
    removeWorkspace,
    setBackNavigationButton,
    removeBackNavigationButton,
    backNavigationButton
  };
});
