/**
 * MonoCoop Widget SDK
 * Безопасное встраивание виджетов через iframe
 *
 * @version 1.0.0
 * @author MonoCoop Team
 */

(function (window, document) {
  'use strict';

  // Константы
  const WIDGET_MESSAGE_TYPES = {
    WIDGET_READY: 'widget:ready',
    WIDGET_DATA_CHANGE: 'widget:data-change',
    WIDGET_ERROR: 'widget:error',
    WIDGET_NAVIGATE: 'widget:navigate',
    WIDGET_RESIZE: 'widget:resize',
    WIDGET_INIT: 'widget:init',
    WIDGET_SET_DATA: 'widget:set-data',
    WIDGET_GET_DATA: 'widget:get-data',
    WIDGET_NAVIGATE_TO: 'widget:navigate-to',
    WIDGET_UPDATE_CONFIG: 'widget:update-config',
    WIDGET_DESTROY: 'widget:destroy',
  };

  const DEFAULT_CONFIG = {
    width: '100%',
    height: '400px',
    theme: 'light',
    hideHeader: true,
    hideFooter: true,
    disableNavigation: false,
    sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups',
    allowedOrigins: [],
    autoResize: true,
    loadingText: 'Загрузка...',
    errorText: 'Ошибка загрузки виджета',
    timeout: 10000,
  };

  /**
   * Класс для создания и управления виджетом
   */
  class MonoCoopWidget {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.iframe = null;
      this.container = null;
      this.isReady = false;
      this.isDestroyed = false;
      this.messageHandlers = new Map();
      this.pendingMessages = [];
      this.loadingTimeout = null;
      this.resizeObserver = null;

      // Валидация обязательных параметров
      this.validateConfig();

      // Генерируем уникальный ID
      this.id = this.generateId();

      // Инициализируем обработчики событий
      this.setupEventHandlers();
    }

    /**
     * Валидация конфигурации
     */
    validateConfig() {
      if (!this.config.baseUrl) {
        throw new Error('MonoCoop Widget: baseUrl is required');
      }

      if (!this.config.containerId && !this.config.container) {
        throw new Error(
          'MonoCoop Widget: containerId or container is required',
        );
      }

      // Добавляем текущий origin в разрешенные
      const currentOrigin = window.location.origin;
      if (!this.config.allowedOrigins.includes(currentOrigin)) {
        this.config.allowedOrigins.push(currentOrigin);
      }
    }

    /**
     * Генерация уникального ID
     */
    generateId() {
      return 'monocoop-widget-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
      this.messageHandler = this.handleMessage.bind(this);
      window.addEventListener('message', this.messageHandler);
    }

    /**
     * Создание и монтирование виджета
     */
    mount() {
      if (this.isDestroyed) {
        throw new Error('MonoCoop Widget: Cannot mount destroyed widget');
      }

      // Получаем контейнер
      this.container = this.getContainer();
      if (!this.container) {
        throw new Error('MonoCoop Widget: Container not found');
      }

      // Создаем iframe
      this.createIframe();

      // Показываем индикатор загрузки
      this.showLoading();

      // Устанавливаем timeout для загрузки
      this.setLoadingTimeout();

      // Монтируем в DOM
      this.container.appendChild(this.iframe);

      return this;
    }

    /**
     * Получение контейнера
     */
    getContainer() {
      if (this.config.container) {
        return this.config.container;
      }

      if (this.config.containerId) {
        return document.getElementById(this.config.containerId);
      }

      return null;
    }

    /**
     * Создание iframe
     */
    createIframe() {
      this.iframe = document.createElement('iframe');

      // Базовые атрибуты
      this.iframe.id = this.id;
      this.iframe.src = this.buildWidgetUrl();
      this.iframe.style.width = this.config.width;
      this.iframe.style.height = this.config.height;
      this.iframe.style.border = 'none';
      this.iframe.style.display = 'block';
      this.iframe.frameBorder = '0';
      this.iframe.scrolling = 'no';

      // Безопасность
      this.iframe.sandbox = this.config.sandbox;

      // Доступность
      this.iframe.title = 'MonoCoop Widget';
      this.iframe.setAttribute('aria-label', 'MonoCoop Widget');

      // Загрузка
      this.iframe.onload = () => {
        this.clearLoadingTimeout();
        this.initializeWidget();
      };

      this.iframe.onerror = () => {
        this.handleLoadError();
      };
    }

    /**
     * Построение URL для виджета
     */
    buildWidgetUrl() {
      const url = new URL(this.config.baseUrl);

      // Добавляем параметры виджета
      url.searchParams.set('widget', 'true');

      // Конфигурация
      const widgetConfig = {
        theme: this.config.theme,
        hideHeader: this.config.hideHeader,
        hideFooter: this.config.hideFooter,
        disableNavigation: this.config.disableNavigation,
        allowedOrigins: this.config.allowedOrigins,
      };

      url.searchParams.set(
        'widget_config',
        encodeURIComponent(JSON.stringify(widgetConfig)),
      );

      // Начальная страница
      if (this.config.page) {
        url.searchParams.set('widget_page', this.config.page);
      }

      // Origin
      url.searchParams.set('widget_origin', window.location.origin);

      return url.toString();
    }

    /**
     * Отображение индикатора загрузки
     */
    showLoading() {
      if (!this.config.loadingText) return;

      const loading = document.createElement('div');
      loading.id = this.id + '-loading';
      loading.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 1000;
        pointer-events: none;
      `;
      loading.textContent = this.config.loadingText;

      this.container.style.position = 'relative';
      this.container.appendChild(loading);
    }

    /**
     * Скрытие индикатора загрузки
     */
    hideLoading() {
      const loading = document.getElementById(this.id + '-loading');
      if (loading) {
        loading.remove();
      }
    }

    /**
     * Установка timeout для загрузки
     */
    setLoadingTimeout() {
      if (this.config.timeout > 0) {
        this.loadingTimeout = setTimeout(() => {
          this.handleLoadError();
        }, this.config.timeout);
      }
    }

    /**
     * Очистка timeout загрузки
     */
    clearLoadingTimeout() {
      if (this.loadingTimeout) {
        clearTimeout(this.loadingTimeout);
        this.loadingTimeout = null;
      }
    }

    /**
     * Инициализация виджета
     */
    initializeWidget() {
      const message = {
        type: WIDGET_MESSAGE_TYPES.WIDGET_INIT,
        data: {
          config: {
            theme: this.config.theme,
            hideHeader: this.config.hideHeader,
            hideFooter: this.config.hideFooter,
            disableNavigation: this.config.disableNavigation,
            allowedOrigins: this.config.allowedOrigins,
          },
          initialData: this.config.initialData,
        },
        timestamp: Date.now(),
        id: this.generateMessageId(),
      };

      this.postMessage(message);
    }

    /**
     * Обработка ошибки загрузки
     */
    handleLoadError() {
      this.clearLoadingTimeout();
      this.hideLoading();

      if (this.config.errorText) {
        this.showError(this.config.errorText);
      }

      this.emit('error', new Error('Widget failed to load'));
    }

    /**
     * Отображение ошибки
     */
    showError(message) {
      const error = document.createElement('div');
      error.style.cssText = `
        padding: 20px;
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        text-align: center;
      `;
      error.textContent = message;

      if (this.iframe) {
        this.iframe.style.display = 'none';
      }

      this.container.appendChild(error);
    }

    /**
     * Обработка сообщений от виджета
     */
    handleMessage(event) {
      // Проверяем origin
      if (!this.isOriginAllowed(event.origin)) {
        return;
      }

      // Проверяем структуру сообщения
      if (!this.isValidMessage(event.data)) {
        return;
      }

      const message = event.data;

      switch (message.type) {
        case WIDGET_MESSAGE_TYPES.WIDGET_READY:
          this.handleWidgetReady(message.data);
          break;

        case WIDGET_MESSAGE_TYPES.WIDGET_DATA_CHANGE:
          this.emit('dataChange', message.data);
          break;

        case WIDGET_MESSAGE_TYPES.WIDGET_ERROR:
          this.emit('error', message.data);
          break;

        case WIDGET_MESSAGE_TYPES.WIDGET_NAVIGATE:
          this.emit('navigate', message.data);
          break;

        case WIDGET_MESSAGE_TYPES.WIDGET_RESIZE:
          this.handleResize(message.data);
          break;
      }
    }

    /**
     * Проверка разрешенного origin
     */
    isOriginAllowed(origin) {
      const widgetUrl = new URL(this.config.baseUrl);
      return origin === widgetUrl.origin;
    }

    /**
     * Проверка валидности сообщения
     */
    isValidMessage(message) {
      return (
        message &&
        typeof message === 'object' &&
        typeof message.type === 'string' &&
        typeof message.timestamp === 'number' &&
        Object.values(WIDGET_MESSAGE_TYPES).includes(message.type)
      );
    }

    /**
     * Обработка готовности виджета
     */
    handleWidgetReady(data) {
      this.isReady = true;
      this.hideLoading();

      // Отправляем отложенные сообщения
      this.processPendingMessages();

      // Настраиваем автоматическое изменение размера
      if (this.config.autoResize) {
        this.setupAutoResize();
      }

      this.emit('ready', data);
    }

    /**
     * Обработка изменения размера
     */
    handleResize(dimensions) {
      if (this.config.autoResize && this.iframe) {
        if (dimensions.width) {
          this.iframe.style.width = dimensions.width + 'px';
        }
        if (dimensions.height) {
          this.iframe.style.height = dimensions.height + 'px';
        }
      }

      this.emit('resize', dimensions);
    }

    /**
     * Настройка автоматического изменения размера
     */
    setupAutoResize() {
      // Наблюдаем за изменениями размера контейнера
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.requestResize();
        });

        this.resizeObserver.observe(this.container);
      }
    }

    /**
     * Запрос изменения размера
     */
    requestResize() {
      // Здесь можно добавить логику для запроса изменения размера от виджета
    }

    /**
     * Отправка сообщения виджету
     */
    postMessage(message) {
      if (!this.iframe || !this.iframe.contentWindow) {
        this.pendingMessages.push(message);
        return;
      }

      const widgetUrl = new URL(this.config.baseUrl);
      this.iframe.contentWindow.postMessage(message, widgetUrl.origin);
    }

    /**
     * Обработка отложенных сообщений
     */
    processPendingMessages() {
      while (this.pendingMessages.length > 0) {
        const message = this.pendingMessages.shift();
        this.postMessage(message);
      }
    }

    /**
     * Генерация ID сообщения
     */
    generateMessageId() {
      return Math.random().toString(36).substr(2, 9);
    }

    /**
     * API методы
     */

    /**
     * Установка данных в виджет
     */
    setData(data) {
      const message = {
        type: WIDGET_MESSAGE_TYPES.WIDGET_SET_DATA,
        data: data,
        timestamp: Date.now(),
        id: this.generateMessageId(),
      };

      this.postMessage(message);
      return this;
    }

    /**
     * Получение данных из виджета
     */
    getData() {
      return new Promise((resolve) => {
        const messageId = this.generateMessageId();

        const message = {
          type: WIDGET_MESSAGE_TYPES.WIDGET_GET_DATA,
          timestamp: Date.now(),
          id: messageId,
        };

        // Ждем ответ
        this.once('dataChange', (data) => {
          resolve(data);
        });

        this.postMessage(message);
      });
    }

    /**
     * Навигация в виджете
     */
    navigateTo(path) {
      const message = {
        type: WIDGET_MESSAGE_TYPES.WIDGET_NAVIGATE_TO,
        data: path,
        timestamp: Date.now(),
        id: this.generateMessageId(),
      };

      this.postMessage(message);
      return this;
    }

    /**
     * Обновление конфигурации
     */
    updateConfig(config) {
      Object.assign(this.config, config);

      const message = {
        type: WIDGET_MESSAGE_TYPES.WIDGET_UPDATE_CONFIG,
        data: config,
        timestamp: Date.now(),
        id: this.generateMessageId(),
      };

      this.postMessage(message);
      return this;
    }

    /**
     * Уничтожение виджета
     */
    destroy() {
      if (this.isDestroyed) return;

      this.isDestroyed = true;

      // Отправляем сообщение об уничтожении
      const message = {
        type: WIDGET_MESSAGE_TYPES.WIDGET_DESTROY,
        timestamp: Date.now(),
        id: this.generateMessageId(),
      };

      this.postMessage(message);

      // Очищаем ресурсы
      this.cleanup();
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
      // Убираем обработчики событий
      window.removeEventListener('message', this.messageHandler);

      // Очищаем timeouts
      this.clearLoadingTimeout();

      // Останавливаем наблюдение за размерами
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      // Удаляем iframe
      if (this.iframe && this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe);
      }

      // Очищаем ссылки
      this.iframe = null;
      this.container = null;
      this.messageHandlers.clear();
      this.pendingMessages = [];
    }

    /**
     * Система событий
     */

    /**
     * Подписка на событие
     */
    on(event, callback) {
      if (!this.messageHandlers.has(event)) {
        this.messageHandlers.set(event, []);
      }
      this.messageHandlers.get(event).push(callback);
      return this;
    }

    /**
     * Одноразовая подписка на событие
     */
    once(event, callback) {
      const onceCallback = (...args) => {
        callback(...args);
        this.off(event, onceCallback);
      };
      this.on(event, onceCallback);
      return this;
    }

    /**
     * Отписка от события
     */
    off(event, callback) {
      const handlers = this.messageHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(callback);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
      return this;
    }

    /**
     * Вызов обработчиков событий
     */
    emit(event, ...args) {
      const handlers = this.messageHandlers.get(event);
      if (handlers) {
        handlers.forEach((callback) => {
          try {
            callback(...args);
          } catch (error) {
            console.error('MonoCoop Widget event handler error:', error);
          }
        });
      }
      return this;
    }
  }

  /**
   * Фабрика для создания виджетов
   */
  const MonoCoopWidgetSDK = {
    /**
     * Создание нового виджета
     */
    create(config) {
      return new MonoCoopWidget(config);
    },

    /**
     * Быстрое создание и монтирование виджета
     */
    mount(config) {
      const widget = new MonoCoopWidget(config);
      widget.mount();
      return widget;
    },

    /**
     * Версия SDK
     */
    version: '1.0.0',

    /**
     * Константы
     */
    MESSAGE_TYPES: WIDGET_MESSAGE_TYPES,
    DEFAULT_CONFIG: DEFAULT_CONFIG,
  };

  // Экспортируем в глобальную область
  window.MonoCoopWidget = MonoCoopWidgetSDK;

  // Если используется module system
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonoCoopWidgetSDK;
  }

  // AMD поддержка
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return MonoCoopWidgetSDK;
    });
  }
})(window, document);
