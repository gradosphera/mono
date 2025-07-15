# Widget System - Руководство для разработчиков

## Быстрые рецепты для повседневной работы

### 1. Проверка widget режима

```typescript
import { useWidgetBridge } from 'src/shared/lib/widget';

const { isWidget } = useWidgetBridge();

// В template
<div v-if="!isWidget" class="desktop-only">
  Видно только в обычном режиме
</div>

// В script
if (isWidget.value) {
  // Логика для widget режима
}
```

### 2. Отправка данных в родительское окно

```typescript
const { sendData, isReady } = useWidgetBridge();

// Отправка пользовательских данных
if (isReady.value) {
  sendData({
    type: 'user-action',
    action: 'form-submit',
    data: formData,
  });
}
```

### 3. Обработка ошибок в widget

```typescript
const { sendError } = useWidgetBridge();

try {
  await someAsyncOperation();
} catch (error) {
  if (isWidget.value) {
    sendError({
      type: 'operation-failed',
      message: error.message,
      context: 'user-registration',
    });
  }
}
```

### 4. Навигация в widget

```typescript
const { sendNavigation } = useWidgetBridge();

// При программной навигации
function navigateToPage(path: string) {
  if (isWidget.value) {
    sendNavigation(path);
  } else {
    router.push(path);
  }
}
```

### 5. Адаптивные стили для widget

```scss
.my-component {
  padding: 2rem;

  // Компактные стили для widget
  .widget-mode & {
    padding: 1rem;

    .title {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
  }
}
```

### 6. Условная функциональность

```typescript
// Отключение определенных функций в widget
const showAdvancedFeatures = computed(() => {
  return !isWidget.value || config.allowAdvancedFeatures;
});

// Условный рендеринг
<q-btn
  v-if="showAdvancedFeatures"
  @click="openAdvancedDialog"
>
  Расширенные настройки
</q-btn>
```

### 7. Слушание событий от родительского окна

```typescript
const { on, off } = useWidgetBridge();

onMounted(() => {
  // Подписка на события
  on('user-data-update', handleUserDataUpdate);
  on('theme-change', handleThemeChange);
});

onUnmounted(() => {
  // Отписка при размонтировании
  off('user-data-update', handleUserDataUpdate);
  off('theme-change', handleThemeChange);
});

function handleUserDataUpdate(data: any) {
  console.log('User data updated:', data);
}
```

### 8. Автоматическое изменение размера

```typescript
const { sendResize } = useWidgetBridge();

// После изменения содержимого
function updateContent() {
  // Обновляем контент
  content.value = newContent;

  // Уведомляем о изменении размера
  nextTick(() => {
    if (isWidget.value) {
      const height = document.body.scrollHeight;
      sendResize({ width: 0, height });
    }
  });
}
```

### 9. Работа с формами в widget

```vue
<template>
  <q-form @submit="onSubmit" class="widget-form">
    <q-input
      v-model="email"
      label="Email"
      :rules="emailRules"
      outlined
      :dense="isWidget"
    />

    <q-btn
      type="submit"
      :label="isWidget ? 'Готово' : 'Отправить'"
      color="primary"
      :size="isWidget ? 'md' : 'lg'"
      class="full-width"
    />
  </q-form>
</template>

<script setup>
const { isWidget, sendData } = useWidgetBridge();

async function onSubmit() {
  try {
    const result = await submitForm();

    if (isWidget.value) {
      // Отправляем результат в родительское окно
      sendData({
        type: 'form-success',
        data: result,
      });
    } else {
      // Показываем уведомление
      $q.notify('Форма отправлена');
    }
  } catch (error) {
    // Обработка ошибки
  }
}
</script>
```

### 10. Композабл для widget-aware компонентов

```typescript
// composables/useWidgetAware.ts
export function useWidgetAware() {
  const { isWidget, config } = useWidgetBridge();

  // Размеры для widget
  const componentSize = computed(() => {
    return isWidget.value ? 'sm' : 'md';
  });

  // Отступы для widget
  const componentSpacing = computed(() => {
    return isWidget.value ? 'xs' : 'md';
  });

  // Показывать ли дополнительные элементы
  const showExtras = computed(() => {
    return !isWidget.value || config.showExtras;
  });

  return {
    isWidget,
    componentSize,
    componentSpacing,
    showExtras,
  };
}
```

### 11. Пример страницы с widget поддержкой

```vue
<template>
  <q-page class="auth-page" :class="pageClasses">
    <div class="auth-container">
      <!-- Заголовок только в обычном режиме -->
      <q-card-section v-if="!isWidget" class="text-center">
        <div class="text-h4">{{ pageTitle }}</div>
        <div class="text-subtitle2">{{ pageSubtitle }}</div>
      </q-card-section>

      <!-- Основной контент -->
      <q-card-section>
        <AuthForm
          @success="handleSuccess"
          @error="handleError"
          :compact="isWidget"
        />
      </q-card-section>

      <!-- Дополнительные ссылки только в обычном режиме -->
      <q-card-section v-if="!isWidget" class="text-center">
        <router-link to="/signup">Регистрация</router-link>
        <router-link to="/recovery">Восстановление</router-link>
      </q-card-section>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue';
import { useWidgetBridge } from 'src/shared/lib/widget';

const { isWidget, sendData, sendError } = useWidgetBridge();

const pageClasses = computed(() => ({
  'widget-mode': isWidget.value,
  'desktop-mode': !isWidget.value,
}));

const pageTitle = computed(() => {
  return isWidget.value ? 'Вход' : 'Добро пожаловать';
});

const pageSubtitle = computed(() => {
  return isWidget.value ? '' : 'Войдите в свой аккаунт';
});

function handleSuccess(data) {
  if (isWidget.value) {
    sendData({
      type: 'auth-success',
      user: data.user,
    });
  } else {
    $q.notify('Вход выполнен успешно');
    $router.push('/dashboard');
  }
}

function handleError(error) {
  if (isWidget.value) {
    sendError({
      type: 'auth-error',
      message: error.message,
    });
  } else {
    $q.notify({
      type: 'negative',
      message: error.message,
    });
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  &.widget-mode {
    min-height: auto;
    padding: 0.5rem;

    .auth-container {
      max-width: none;
      box-shadow: none;
      border-radius: 0;
    }
  }

  &.desktop-mode {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .auth-container {
      max-width: 400px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
  }
}
</style>
```

## Лучшие практики

### 1. Всегда проверяйте готовность

```typescript
// ❌ Плохо
sendData({ some: 'data' });

// ✅ Хорошо
if (isReady.value) {
  sendData({ some: 'data' });
}
```

### 2. Используйте TypeScript типы

```typescript
// ✅ Хорошо
import type { IWidgetMessage } from 'src/shared/lib/widget/types';

const message: IWidgetMessage = {
  type: 'widget:data-change',
  data: { user: userData },
  timestamp: Date.now(),
};
```

### 3. Группируйте связанные данные

```typescript
// ❌ Плохо
sendData({ name: 'John' });
sendData({ email: 'john@example.com' });
sendData({ age: 30 });

// ✅ Хорошо
sendData({
  type: 'user-profile',
  user: {
    name: 'John',
    email: 'john@example.com',
    age: 30,
  },
});
```

### 4. Обрабатывайте ошибки

```typescript
// ✅ Хорошо
try {
  await apiCall();
} catch (error) {
  if (isWidget.value) {
    sendError({
      type: 'api-error',
      message: error.message,
      context: 'user-registration',
    });
  }
  // Локальная обработка ошибки
}
```

### 5. Оптимизируйте для widget

```scss
// Используйте CSS переменные для адаптивности
.my-component {
  padding: var(--widget-spacing, 1rem);
  font-size: var(--widget-font-size, 1rem);
  border-radius: var(--widget-border-radius, 4px);
}

// Устанавливайте переменные в widget режиме
.widget-mode {
  --widget-spacing: 0.5rem;
  --widget-font-size: 0.9rem;
  --widget-border-radius: 2px;
}
```

## Отладка

### 1. Включение debug режима

```typescript
// В development
if (process.env.NODE_ENV === 'development') {
  window.widgetDebug = true;
}
```

### 2. Проверка состояния в console

```javascript
// В browser console
console.log('Widget Bridge:', window.__WIDGET_BRIDGE__);
console.log('Widget Mode:', window.__WIDGET_MODE__);
```

### 3. Логирование сообщений

```typescript
// В development режиме
const { sendData } = useWidgetBridge();

const originalSendData = sendData;
sendData = (data) => {
  console.log('Sending widget data:', data);
  return originalSendData(data);
};
```

## Производительность

### 1. Lazy loading для widget

```typescript
// Загружайте тяжелые компоненты только при необходимости
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);

// Используйте условно
<HeavyComponent v-if="!isWidget || config.showHeavyComponent" />
```

### 2. Оптимизация bundle size

```typescript
// Используйте tree shaking
import { useWidgetBridge } from 'src/shared/lib/widget';

// Вместо
import * as widget from 'src/shared/lib/widget';
```

### 3. Мемоизация для widget

```typescript
// Кэшируйте вычисления
const widgetClasses = computed(() => ({
  'widget-mode': isWidget.value,
  'widget-compact': isWidget.value && config.compact,
  'widget-themed': isWidget.value && config.theme,
}));
```

## Типичные проблемы и решения

### 1. Состояние не обновляется

```typescript
// Проблема: состояние не реактивно
let isWidget = false;

// Решение: используйте композабл
const { isWidget } = useWidgetBridge();
```

### 2. Сообщения не доходят

```typescript
// Проблема: отправка до готовности
sendData({ data: 'test' });

// Решение: проверка готовности
if (isReady.value) {
  sendData({ data: 'test' });
}
```

### 3. Стили не применяются

```scss
// Проблема: низкая специфичность
.my-class {
  color: red;
}

// Решение: повышение специфичности
.widget-mode .my-class {
  color: red;
}
```

Эти рецепты помогут вам быстро интегрировать widget систему в ваши компоненты и страницы!
