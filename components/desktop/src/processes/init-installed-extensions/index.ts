import type { Router } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';
import type { IWorkspaceConfig } from 'src/shared/lib/types/workspace';

export async function useInitExtensionsProcess(router: Router) {
  const store = useDesktopStore();
  // Загружаем все модули расширений
  const modules = import.meta.glob('../../../extensions/**/install.{ts,js}');

  for (const path in modules) {
    const mod = await modules[path]();
    if (mod?.default) {
      // Ожидаем, что расширение возвращает массив IWorkspaceConfig[]
      const result = await mod.default();

      // Поддержка обоих форматов: массив или одиночный объект (для обратной совместимости)
      const workspaceConfigs: IWorkspaceConfig[] = Array.isArray(result) ? result : [result];

      // Обрабатываем каждый workspace из расширения
      for (const config of workspaceConfigs) {
        if (config?.workspace && config?.routes?.length) {
          // Записываем маршруты в соответствующий workspace
          store.setRoutes(config.workspace, config.routes as any);
          // Регистрируем маршруты в router, добавляя их в базовый родительский маршрут
          const baseRoute = router.getRoutes().find((r) => r.name === 'base');
          if (baseRoute) {
            config.routes.forEach((r: any) => router.addRoute('base', r));
          }
        }
      }
    }
  }
}

// Функция для динамической загрузки маршрутов конкретного расширения
export async function loadExtensionRoutes(
  extensionName: string,
  router: Router,
) {
  const store = useDesktopStore();

  try {
    // Получаем все доступные модули расширений
    const allModules = import.meta.glob(
      '../../../extensions/**/install.{ts,js}',
    );

    // Находим путь к модулю нужного расширения
    const modulePath = Object.keys(allModules).find((path) => {
      // Извлекаем имя расширения из пути: ../../../extensions/{extensionName}/install.{ts,js}
      const pathParts = path.split('/');
      const extName = pathParts[pathParts.length - 2]; // предпоследний элемент - имя папки
      return extName === extensionName;
    });

    if (!modulePath) {
      console.warn(`No module found for extension "${extensionName}"`);
      return;
    }

    const module = await allModules[modulePath]();
    if (module?.default) {
      const result = await module.default();

      // Поддержка обоих форматов: массив или одиночный объект (для обратной совместимости)
      const workspaceConfigs: IWorkspaceConfig[] = Array.isArray(result) ? result : [result];

      // Обрабатываем каждый workspace из расширения
      for (const config of workspaceConfigs) {
        if (config?.workspace && config?.routes?.length) {
          // Записываем маршруты в соответствующий workspace
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
                router.addRoute('base', r);
              }
            });
          }
        }
      }

      console.log(
        `Routes for extension "${extensionName}" loaded successfully (${workspaceConfigs.length} workspace(s))`,
      );
    }
  } catch (error) {
    console.error(
      `Failed to load routes for extension "${extensionName}":`,
      error,
    );
  }
}
