import { useDesktopStore } from 'src/entities/Desktop/model';
import { useSystemStore } from 'src/entities/System/model';
import { useInitWalletProcess } from 'src/processes/init-wallet';
import type { Router } from 'vue-router';
import { useBranchOverlayProcess } from '../watch-branch-overlay';
import { setupNavigationGuard } from '../navigation-guard-setup';
import { useInitExtensionsProcess } from 'src/processes/init-installed-extensions';
import { applyThemeFromStorage } from 'src/shared/lib/utils';
import { useSessionStore } from 'src/entities/Session';

export async function useInitAppProcess(router: Router) {
  applyThemeFromStorage();
  const system = useSystemStore();

  try {
  await system.loadSystemInfo();
  } catch (error) {
    console.warn('Failed to load initial system info, backend might be unavailable:', error);
    // Продолжаем инициализацию даже при недоступности бэкенда
  }

  // Запускаем мониторинг системной информации для отслеживания статуса
  system.startSystemMonitoring();

  const desktops = useDesktopStore();

  try {
  await desktops.loadDesktop();
  } catch (error) {
    console.warn('Failed to load desktop configuration:', error);
    // Продолжаем инициализацию даже при ошибках загрузки десктопа
  }

  // Регистрируем маршруты рабочего стола до выбора активного рабочего стола
  desktops.registerWorkspaceMenus(router);

  await useInitWalletProcess().run();

  // Выбираем рабочий стол на основе прав пользователя или сохраненного выбора
  // только если пользователь авторизован
  const session = useSessionStore();
  if (session.isAuth) {
    desktops.selectDefaultWorkspace();
  }

  useBranchOverlayProcess();

  setupNavigationGuard(router);

  await useInitExtensionsProcess(router);
}
