<template lang="pug">
div.settings-form
  .setting-item(
    v-for="item in visibleProperties"
    :key="item.propertyName"
  )
    .setting-header
      .setting-title.text-subtitle1 {{ getLabel(item.property, item.propertyName) }}
      .setting-hint.text-body2(v-if="getHint(item.property)")
        | {{ getHint(item.property) }}

    .setting-input
      component(
        standout="bg-teal text-white"
        :is="getComponentType(item.property)"
        v-bind="getComponentProps(item.property, item.propertyName)"
      )
        // Слот для prepend, если указано
        template(v-slot:prepend v-if="item.property.description?.prepend")
          span {{ item.property.description.prepend }}

        // Слот для append, если указано или нужна иконка видимости пароля/копирования
        template(v-slot:append)
          span(v-if="item.property.description?.append") {{ item.property.description.append }}
          q-icon.cursor-pointer(
            v-if="shouldShowCopyIcon(item.property) || item.property.description?.password"
            :name="getIconName(item.propertyName)"
            @click="handleIconClick(item.propertyName)"
          )

</template>
<script lang="ts" setup>
  import { reactive, watch, computed } from 'vue';
  import { QInput, QCheckbox, QSelect, copyToClipboard } from 'quasar';
  import type { IExtensionConfigSchema, ISchemaProperty } from 'src/entities/Extension/model';
  import { SuccessAlert } from 'src/shared/api/alerts';

  // Устанавливаем имя компонента для рекурсивного вызова
  defineOptions({
    name: 'DynamicForm'
  });

  // Определяем пропсы и события компонента
  const props = defineProps<{
    schema: IExtensionConfigSchema;
    modelValue: Record<string, any>;
    /** Режим установки - включает генерацию значений для полей с generator */
    installMode?: boolean;
  }>();

  const emit = defineEmits(['update:modelValue']);

  // Состояние видимости паролей для каждого поля
  const passwordVisibility = reactive<Record<string, boolean>>({});

  // Функция переключения видимости пароля
  function togglePasswordVisibility(propertyName: string) {
    passwordVisibility[propertyName] = !passwordVisibility[propertyName];
  }


  // Получение имени иконки для поля
  function getIconName(propertyName: string): string | undefined {
    const property = visibleProperties.value.find(p => p.propertyName === propertyName)?.property;

    if (shouldShowCopyIcon(property)) {
      return 'content_copy'; // Иконка копирования
    } else if (property?.description?.password) {
      return passwordVisibility[propertyName] ? 'visibility' : 'visibility_off';
    }

    return undefined;
  }

  // Определяем, нужно ли показывать иконку копирования
  function shouldShowCopyIcon(property: ISchemaProperty | undefined): boolean {
    if (!property?.description) return false;

    // В режиме установки показываем копирование для полей с generator или copyable
    if (props.installMode) {
      return !!(property.description.generator || property.description.copyable);
    }

    // В обычном режиме показываем копирование только для полей с copyable
    return !!property.description.copyable;
  }

  // Обработка клика по иконке
  function handleIconClick(propertyName: string) {
    const property = visibleProperties.value.find(p => p.propertyName === propertyName)?.property;

    if (shouldShowCopyIcon(property)) {
      // Копируем значение поля в буфер обмена
      const valueToCopy = data[propertyName] || props.modelValue?.[propertyName] || '';
      copyToClipboard(valueToCopy);

      // Показываем уведомление об успешном копировании
      SuccessAlert('Значение скопировано в буфер обмена');
    } else if (property?.description?.password) {
      // Переключаем видимость пароля
      togglePasswordVisibility(propertyName);
    }
  }

  /**
   * Генерирует криптографически стойкую случайную строку
   * @returns Hex-строка длиной 64 символа (256 бит)
   */
  function generateRandomSecret(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Генерирует значение для поля на основе типа генератора
   */
  function generateValue(generatorType: string): any {
    switch (generatorType) {
      case 'randomSecret':
        return generateRandomSecret();
      default:
        return null;
    }
  }

  // Вычисляемое свойство для видимых свойств
  const visibleProperties = computed(() => {
    return Object.entries(props.schema.properties)
      .filter(([, property]) => isVisible(property as ISchemaProperty))
      .map(([propertyName, property]) => ({
        propertyName,
        property: property as ISchemaProperty
      }));
  });

  // Инициализируем реактивные данные
  const data = reactive<Record<string, any>>({});

  // Функция для установки значений по умолчанию (с генерацией при необходимости)
  function setDefaults(schema: ISchemaProperty, obj: any, sourceValues?: Record<string, any>) {
    if (schema.type === 'object' && schema.properties) {
      for (const key in schema.properties) {
        const property = schema.properties[key];
        const existingValue = sourceValues?.[key];

        // Если есть существующее значение (непустая строка для строковых полей)
        if (existingValue !== undefined && existingValue !== null && existingValue !== '') {
          obj[key] = existingValue;
        } else if (props.installMode && property.description?.generator) {
          // В режиме установки генерируем значение для полей с generator
          obj[key] = generateValue(property.description.generator);
        } else if (props.installMode && property.description?.default !== undefined) {
          // В режиме установки устанавливаем значение из поля default
          obj[key] = property.description.default;
        } else if (property.default !== undefined) {
          obj[key] = property.default;
        } else if (property.type === 'object') {
          obj[key] = {};
          setDefaults(property, obj[key], existingValue);
        } else {
          obj[key] = null;
        }
      }
    }
  }

  // Инициализация данных
  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    // Есть существующие данные - используем их, но проверяем на генерацию
    setDefaults(props.schema, data, props.modelValue);
  } else {
    setDefaults(props.schema, data);
  }

  // Эмитим начальные данные (важно для сгенерированных значений)
  emit('update:modelValue', { ...data });

  // Отслеживание изменений и обновление данных
  watch(
    data,
    () => {
      emit('update:modelValue', { ...data });
    },
    { deep: true }
  );

  // Функция для преобразования строковых правил в функции
  function parseRules(rules: string[]): Array<(val: any) => boolean | string> {
    return rules.map(rule => {
      const fn = new Function('val', `return ${rule};`);
      return (val: any) => fn(val) || `Значение должно удовлетворять правилу: ${rule}`;
    });
  }

  // Функции для получения атрибутов полей
  function getComponentType(property: ISchemaProperty) {
    if (property.enum) {
      return QSelect;
    } else if (property.type === 'number' || property.type === 'integer') {
      return QInput;
    } else if (property.type === 'string') {
      return QInput;
    } else if (property.type === 'boolean') {
      return QCheckbox;
    } else if (property.type === 'object' && property.properties) {
      return 'DynamicForm';
    }
    return 'div';
  }

  function getComponentProps(property: ISchemaProperty, propertyName: string) {
    const componentProps: Record<string, any> = {
      modelValue: data[propertyName],
      'onUpdate:modelValue': (value: any) => {
        data[propertyName] = property.type === 'number' ? parseFloat(value) : value;
      },
    };


    let rules = parseRules(property.description?.rules || []);

    const minLength = property.description?.minLength;
    const maxLength = property.description?.maxLength;

    if (typeof minLength === 'number') {
      rules.push((val: string) => val.length >= minLength || `Минимальная длина: ${minLength}`);
      componentProps.minLength = minLength;
    }

    if (typeof maxLength === 'number') {
      rules.push((val: string) => val.length <= maxLength || `Максимальная длина: ${maxLength}`);
      componentProps.maxLength = maxLength;
    }

    componentProps.rules = rules

    // Добавляем маску и другие настройки, если они указаны
    if (property.description?.mask) {
      componentProps.mask = property.description.mask;
      if (property.description?.fillMask !== undefined) {
        componentProps.fillMask = property.description.fillMask;
      }
    }

    // Поддержка readonly
    if (property.description?.readonly) {
      componentProps.readonly = true;
    }

    // Установка типа поля в зависимости от типа property
    if (property.type === 'number') {
      componentProps.type = 'number';  // Поле будет восприниматься как числовое, разрешены только цифры
    } else if (property.type === 'string') {
      // Проверка на пароль
      if (property.description?.password) {
        // В режиме установки показываем пароль как обычный текст для копирования
        if (props.installMode) {
          componentProps.type = 'text';
        } else {
          componentProps.type = passwordVisibility[propertyName] ? 'text' : 'password';
        }
      } else {
        componentProps.type = 'text';  // Поле для строк
      }
      // Проверка на многосстрочный ввод
      if (property.description?.maxRows) {
        componentProps.type = 'textarea';
        componentProps.autogrow = true; // Автоматический рост поля при вводе
        componentProps.rows = property.description?.maxRows; // Установка максимального количества строк
      }
    }

    if (property.enum) {
      componentProps.options = property.enum;
    }

    if (property.type === 'object') {
      componentProps.schema = property;
    }

    return componentProps;
  }

  function getLabel(property: ISchemaProperty, propertyName: string | number) {
    return property.description?.label || propertyName;
  }

  function getHint(property: ISchemaProperty) {
    return property.description?.note;
  }

  function isVisible(property: ISchemaProperty) {
    return property.description?.visible !== false;
  }

  </script>

<style lang="scss" scoped>
.settings-form {
  .setting-item {
    margin-bottom: 2.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .setting-header {
    margin-bottom: 1.5rem;

    .setting-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }

    .setting-hint {
      line-height: 1.5;
      font-size: 0.95rem;
    }
  }

  .setting-input {
    :deep(.q-field__label) {
      display: none; // Скрываем стандартный label
    }

    :deep(.q-field__prepend),
    :deep(.q-field__append) {
      font-weight: 600;
      font-size: 0.9rem;
    }

    // Стили для вложенных объектов
    :deep(.settings-form) {
      background: rgba(var(--q-primary-rgb), 0.04);
      border: 1px solid rgba(var(--q-primary-rgb), 0.15);
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 1rem;
      margin-bottom: 0;
      transition: all 0.2s ease;

      .q-dark & {
        background: rgba(var(--q-primary-rgb), 0.08);
        border-color: rgba(var(--q-primary-rgb), 0.25);
      }

      &:hover {
        background: rgba(var(--q-primary-rgb), 0.06);

        .q-dark & {
          background: rgba(var(--q-primary-rgb), 0.12);
        }
      }

      .setting-item {
        margin-bottom: 2rem;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .setting-header {
        margin-bottom: 1rem;

        .setting-title {
          font-size: 1rem;
          font-weight: 500;
        }

        .setting-hint {
          font-size: 0.9rem;
        }
      }
    }
  }
}

// Адаптивность для мобильных устройств
@media (max-width: 768px) {
  .settings-form .setting-item {
    margin-bottom: 2rem;
  }

  .setting-header .setting-title {
    font-size: 1rem;
  }

  .setting-header .setting-hint {
    font-size: 0.9rem;
  }
}
</style>
