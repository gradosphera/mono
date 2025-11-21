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

        // Слот для append, если указано
        template(v-slot:append v-if="item.property.description?.append")
          span {{ item.property.description.append }}

</template>
<script lang="ts" setup>
  import { defineProps, defineEmits, reactive, watch, computed } from 'vue';
  import { QInput, QCheckbox, QSelect } from 'quasar';
  import type { IExtensionConfigSchema, ISchemaProperty } from 'src/entities/Extension/model';

  // Устанавливаем имя компонента для рекурсивного вызова
  defineOptions({
    name: 'DynamicForm'
  });

  // Определяем пропсы и события компонента
  const props = defineProps<{
    schema: IExtensionConfigSchema;
    modelValue: Record<string, any>;
  }>();

  const emit = defineEmits(['update:modelValue']);

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

  // Функция для установки значений по умолчанию
  function setDefaults(schema: ISchemaProperty, obj: any) {
    if (schema.type === 'object' && schema.properties) {
      for (const key in schema.properties) {
        const property = schema.properties[key];
        if (property.default !== undefined) {
          obj[key] = property.default;
        } else if (property.type === 'object') {
          obj[key] = {};
          setDefaults(property, obj[key]);
        } else {
          obj[key] = null;
        }
      }
    }
  }

  // Инициализация данных
  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    Object.assign(data, props.modelValue);
  } else {
    setDefaults(props.schema, data);
  }

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
    const props: Record<string, any> = {
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
      props.minLength = minLength;
    }

    if (typeof maxLength === 'number') {
      rules.push((val: string) => val.length <= maxLength || `Максимальная длина: ${maxLength}`);
      props.maxLength = maxLength;
    }

    props.rules = rules

    // Добавляем маску и другие настройки, если они указаны
    if (property.description?.mask) {
      props.mask = property.description.mask;
      if (property.description?.fillMask !== undefined) {
        props.fillMask = property.description.fillMask;
      }
    }

    // Установка типа поля в зависимости от типа property
    if (property.type === 'number') {
      props.type = 'number';  // Поле будет восприниматься как числовое, разрешены только цифры
    } else if (property.type === 'string') {
      props.type = 'text';  // Поле для строк
      // Проверка на многосстрочный ввод
      if (property.description?.maxRows) {
        props.type = 'textarea';
        props.autogrow = true; // Автоматический рост поля при вводе
        props.rows = property.description?.maxRows; // Установка максимального количества строк
      }
    }

    if (property.enum) {
      props.options = property.enum;
    }

    if (property.type === 'object') {
      props.schema = property;
    }

    return props;
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
