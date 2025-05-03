<template lang="pug">
div
  div(flat v-for="(property, propertyName) in schema.properties" :key="propertyName")
    div(v-if="isVisible(property)")
      component(
        standout="bg-teal text-white"
        :is="getComponentType(property)"
        v-bind="getComponentProps(property, propertyName)"
      ).q-mt-lg
        // Слот для prepend, если указано
        template(v-slot:prepend v-if="property.description?.prepend")
          span {{ property.description.prepend }}

        // Слот для append, если указано
        template(v-slot:append v-if="property.description?.append")
          span {{ property.description.append }}

</template>
<script lang="ts" setup>
  import { defineProps, defineEmits, reactive, watch } from 'vue';
  import { QInput, QCheckbox, QSelect, QCard } from 'quasar';
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
      label: getLabel(property, propertyName),
      hint: getHint(property)
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

  function getLabel(property: ISchemaProperty, propertyName: string) {
    return property.description?.label || propertyName;
  }

  function getHint(property: ISchemaProperty) {
    return property.description?.note;
  }

  function isVisible(property: ISchemaProperty) {
    return property.description?.visible !== false;
  }

  </script>
