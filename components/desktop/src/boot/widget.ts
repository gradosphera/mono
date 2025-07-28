import { boot } from 'quasar/wrappers';
import { widgetModeInstance } from 'src/shared/lib/widget/widget-mode';
import { widgetEventManager } from 'src/shared/lib/widget/widget-events';

export default boot(({ app, router }) => {
  // Проверяем, что мы на клиенте
  if (typeof window === 'undefined') return;

  // Принудительно инициализируем widget mode на клиенте
  widgetModeInstance.forceInitialize();

  // Получаем состояние widget
  const widgetState = widgetModeInstance.getState();

  // Если работаем в widget режиме
  if (widgetState.isWidget.value) {
    console.log('[Widget Boot] Widget mode detected');

    // Инициализируем менеджер событий
    widgetEventManager.initialize();

    // Настраиваем navigation guard для widget режима
    router.beforeEach((to, from, next) => {
      // Применяем widget meta данные для всех маршрутов в widget режиме
      if (widgetState.isWidget.value) {
        to.meta = {
          ...to.meta,
          layout: 'widget',
        };
      }
      next();
    });

    // Добавляем глобальные свойства для доступа к widget API
    app.config.globalProperties.$widget = {
      isWidget: widgetState.isWidget,
      isReady: widgetState.isReady,
      config: widgetState.config,
    };

    // Предоставляем widget API через provide/inject
    app.provide('widget', {
      isWidget: widgetState.isWidget,
      isReady: widgetState.isReady,
      config: widgetState.config,
    });

    console.log('[Widget Boot] Widget mode initialized');
  }

  // Очистка при уничтожении приложения
  const originalUnmount = app.unmount;
  app.unmount = function () {
    widgetEventManager.destroy();
    return originalUnmount.call(this);
  };
});
