import type { Router } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';
import { extensionsRegistry, getAvailableExtensions } from './extensions-registry';

export async function useInitExtensionsProcess(router: Router) {
  const store = useDesktopStore();

  console.log('📦 [InitExtensions] Starting initialization with extensions registry');

  // Получаем список всех доступных расширений
  const availableExtensions = getAvailableExtensions();

  console.log('📦 [InitExtensions] Available extensions:', availableExtensions);

  // Загружаем все расширения из регистра
  for (const extensionName of availableExtensions) {
    try {
      console.log(`📦 [InitExtensions] Loading extension: ${extensionName}`);

      const installFunction = extensionsRegistry[extensionName];
      const result = await installFunction();

      // Поддержка обоих форматов: массив или одиночный объект (для обратной совместимости)
      const workspaceConfigs: IWorkspaceConfig[] = Array.isArray(result) ? result : [result];

      console.log(`📦 [InitExtensions] Extension "${extensionName}" loaded, configs:`, workspaceConfigs.length);

      // Обрабатываем каждый workspace из расширения
      for (const config of workspaceConfigs) {
        if (config?.workspace && config?.routes?.length) {
          console.log(`📦 [InitExtensions] Setting routes for workspace: ${config.workspace}`);

          // Записываем маршруты в соответствующий workspace
          store.setRoutes(config.workspace, config.routes as any);

          // Регистрируем маршруты в router, добавляя их в базовый родительский маршрут
          const baseRoute = router.getRoutes().find((r) => r.name === 'base');
          if (baseRoute) {
            config.routes.forEach((r: any) => {
              // Проверяем, не зарегистрирован ли уже маршрут
              const existingRoute = router.getRoutes().find((route) => route.name === r.name);
              if (!existingRoute) {
                console.log(`📦 [InitExtensions] Adding route to router: ${r.name}`);
                router.addRoute('base', r);
              } else {
                console.log(`📦 [InitExtensions] Route already exists, skipping: ${r.name}`);
              }
            });
          }
        }
      }
    } catch (error) {
      console.error(`📦 [InitExtensions] Failed to load extension "${extensionName}":`, error);
      // Продолжаем загрузку других расширений даже если одно не загрузилось
    }
  }

  console.log('📦 [InitExtensions] All extensions initialization completed');
}

// Функция для динамической загрузки маршрутов конкретного расширения
export async function loadExtensionRoutes(
  extensionName: string,
  router: Router,
) {
  const store = useDesktopStore();

  try {
    console.log('📦 [LoadExtensionRoutes] Starting to load routes for extension:', extensionName);

    // Получаем функцию установки из регистра
    const installFunction = extensionsRegistry[extensionName];

    if (!installFunction) {
      console.warn(`📦 [LoadExtensionRoutes] Extension "${extensionName}" not found in registry`);
      return;
    }

    console.log('📦 [LoadExtensionRoutes] Found extension in registry, loading...');

    const result = await installFunction();
    console.log('📦 [LoadExtensionRoutes] Extension loaded, result:', result);

    // Поддержка обоих форматов: массив или одиночный объект (для обратной совместимости)
    const workspaceConfigs: IWorkspaceConfig[] = Array.isArray(result) ? result : [result];

    console.log('📦 [LoadExtensionRoutes] Processing workspace configs:', workspaceConfigs.length);

    // Обрабатываем каждый workspace из расширения
    for (const config of workspaceConfigs) {
      console.log('📦 [LoadExtensionRoutes] Processing workspace config:', {
        workspace: config.workspace,
        routesCount: config.routes?.length,
        routes: config.routes?.map(r => ({ name: r.name, meta: r.meta }))
      });

      if (config?.workspace && config?.routes?.length) {
        // Записываем маршруты в соответствующий workspace
        console.log('📦 [LoadExtensionRoutes] Setting routes for workspace:', config.workspace);
        store.setRoutes(config.workspace, config.routes as any);

        // Регистрируем маршруты в router
        const baseRoute = router.getRoutes().find((r) => r.name === 'base');
        if (baseRoute) {
          config.routes.forEach((r: any) => {
            // Проверяем, не зарегистрирован ли уже маршрут
            const existingRoute = router
              .getRoutes()
              .find((route) => route.name === r.name);
            if (!existingRoute) {
              console.log('📦 [LoadExtensionRoutes] Adding route to router:', r.name);
              router.addRoute('base', r);
            } else {
              console.log('📦 [LoadExtensionRoutes] Route already exists, skipping:', r.name);
            }
          });
        }
      }
    }

    console.log(
      `📦 [LoadExtensionRoutes] Routes for extension "${extensionName}" loaded successfully (${workspaceConfigs.length} workspace(s))`,
    );
  } catch (error) {
    console.error(
      `📦 [LoadExtensionRoutes] Failed to load routes for extension "${extensionName}":`,
      error,
    );
  }
}
