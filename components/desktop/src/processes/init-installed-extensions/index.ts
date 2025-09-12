import type { Router } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';

export async function useInitExtensionsProcess(router: Router) {
  const store = useDesktopStore();
  // Загружаем все модули расширений
  const modules = import.meta.glob('../../../extensions/**/install.{ts,js}');

  for (const path in modules) {
    const mod = await modules[path]();
    if (mod?.default) {
      // Ожидаем, что расширение возвращает объект { workspace, routes }
      const result = await mod.default();
      if (result?.workspace && result?.routes?.length) {
        // Записываем маршруты в соответствующий workspace
        store.setRoutes(result.workspace, result.routes);
        // Регистрируем маршруты в router, добавляя их в базовый родительский маршрут (например, "base")
        const baseRoute = router.getRoutes().find((r) => r.name === 'base');
        if (baseRoute) {
          result.routes.forEach((r: any) => router.addRoute('base', r));
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
      if (result?.workspace && result?.routes?.length) {
        // Записываем маршруты в соответствующий workspace
        store.setRoutes(result.workspace, result.routes);
        // Регистрируем маршруты в router
        const baseRoute = router.getRoutes().find((r) => r.name === 'base');
        if (baseRoute) {
          result.routes.forEach((r: any) => {
            // Проверяем, не зарегистрирован ли уже маршрут
            const existingRoute = router
              .getRoutes()
              .find((route) => route.name === r.name);
            if (!existingRoute) {
              router.addRoute('base', r);
            }
          });
        }
        console.log(
          `Routes for extension "${extensionName}" loaded successfully`,
        );
      }
    }
  } catch (error) {
    console.error(
      `Failed to load routes for extension "${extensionName}":`,
      error,
    );
  }
}
