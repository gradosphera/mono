<template>
  <div class="milkdown-editor-container"
    :class="{ 'milkdown-editor--readonly': readonly, 'milkdown-editor--dark': isDark }" :style="editorContainerStyle">
    <div ref="editorRef" class="milkdown-editor"></div>
    <div v-if="error" class="milkdown-editor-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, getCurrentInstance } from 'vue';
import { Crepe } from '@milkdown/crepe';
// Import base styles first
import '@milkdown/crepe/theme/common/style.css';

interface Props {
  modelValue: string | null | undefined;
  readonly?: boolean;
  placeholder?: string;
  minHeight?: number;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'ready'): void;
  (e: 'change'): void;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  placeholder: 'Начните писать...',
  minHeight: 0,
});

const emit = defineEmits<Emits>();

const instance = getCurrentInstance();
const { $q } = instance?.proxy as any;
const isDark = computed(() => $q?.dark?.isActive || false);

const editorContainerStyle = computed(() => {
  return props.minHeight ? { minHeight: `${props.minHeight}px` } : {};
});

const editorRef = ref<HTMLDivElement>();
const crepe = ref<Crepe>();
const error = ref<string>('');
const isMounted = ref(false);
const isDestroyed = ref(false);
const isUpdating = ref(false);
const isInternalChange = ref(false);
const currentTheme = ref(isDark.value ? 'frame-dark' : 'frame');

// Функция для загрузки темы
const loadTheme = async (theme: string) => {
  try {
    if (theme === 'frame') {
      await import('@milkdown/crepe/theme/frame.css');
    } else if (theme === 'frame-dark') {
      await import('@milkdown/crepe/theme/frame-dark.css');
    }
  } catch (err) {
    console.error('Failed to load theme:', err);
  }
};

const initEditor = async () => {
  if (typeof window === 'undefined') return;
  if (!editorRef.value) return;
  if (crepe.value || isDestroyed.value) return;

  isMounted.value = true;

  try {
    // Загружаем тему перед созданием редактора
    await loadTheme(currentTheme.value);

    const instance = new Crepe({
      root: editorRef.value,
      defaultValue: props.modelValue || '',
      featureConfigs: {
        placeholder: {
          text: props.placeholder,
          mode: 'block',
        },
      },
    });

    await instance.create();
    crepe.value = instance;

    if (props.readonly) {
      instance.setReadonly(true);
    }

    emit('ready');
    console.log('Milkdown editor created');
  } catch (err) {
    error.value = 'Ошибка инициализации редактора';
    console.error('Milkdown initialization failed:', err);
  }
};

const destroyEditor = async () => {
  if (crepe.value && !isDestroyed.value) {
    isDestroyed.value = true;
    try {
      await crepe.value.destroy();
      console.log('Milkdown editor destroyed');
    } catch (err) {
      console.error('Editor destruction failed:', err);
    } finally {
      crepe.value = undefined;
      isMounted.value = false;
    }
  }
};

// Следим за изменениями modelValue извне
watch(
  () => props.modelValue,
  async (newValue) => {
    // Игнорируем изменения, которые произошли из-за ввода пользователя
    if (isInternalChange.value) return;
    if (!crepe.value || !isMounted.value || isDestroyed.value || isUpdating.value) return;

    try {
      isUpdating.value = true;
      const currentValue = crepe.value.getMarkdown();

      if (newValue !== currentValue) {
        // Пересоздаем редактор с новым значением
        await destroyEditor();
        isDestroyed.value = false;
        await nextTick();
        await initEditor();
      }
    } catch (err) {
      console.error('Failed to update editor content:', err);
    } finally {
      isUpdating.value = false;
    }
  },
);

// Следим за изменениями readonly
watch(
  () => props.readonly,
  async (newReadonly) => {
    if (!crepe.value || !isMounted.value || isDestroyed.value) return;
    try {
      crepe.value.setReadonly(newReadonly);
    } catch (err) {
      console.error('Failed to toggle readonly mode:', err);
    }
  },
);

// Следим за изменениями placeholder
watch(
  () => props.placeholder,
  async () => {
    if (!crepe.value || !isMounted.value || isDestroyed.value) return;
    try {
      // Для обновления плейсхолдера нужно пересоздать редактор
      await destroyEditor();
      isDestroyed.value = false;
      await nextTick();
      await initEditor();
    } catch (err) {
      console.error('Failed to update placeholder:', err);
    }
  },
);

// Следим за изменениями темы
watch(
  isDark,
  async (newIsDark) => {
    const newTheme = newIsDark ? 'frame-dark' : 'frame';

    // Если тема изменилась
    if (newTheme !== currentTheme.value) {
      currentTheme.value = newTheme;

      // Если редактор уже инициализирован, пересоздаем его с новой темой
      if (crepe.value && isMounted.value && !isDestroyed.value) {
        try {
          await destroyEditor();
          isDestroyed.value = false;
          await nextTick();
          await initEditor();
        } catch (err) {
          console.error('Failed to switch theme:', err);
        }
      }
    }
  },
  { immediate: false }
);

// Следим за изменениями в редакторе
watch(
  () => crepe.value,
  (instance) => {
    if (!instance) return;

    // Устанавливаем обработчик изменений через listener
    const listener = () => {
      if (props.readonly || !isMounted.value || isDestroyed.value || isUpdating.value) return;
      try {
        isInternalChange.value = true;
        const markdown = instance.getMarkdown();
        emit('update:modelValue', markdown);
        emit('change');
        // Сбрасываем флаг в nextTick, чтобы родительский компонент успел обработать изменение
        nextTick(() => {
          isInternalChange.value = false;
        });
      } catch (err) {
        console.error('Failed to get markdown:', err);
        isInternalChange.value = false;
      }
    };

    // Добавляем слушатель изменений через DOM события
    const editorElement = editorRef.value?.querySelector('.milkdown');
    if (editorElement) {
      editorElement.addEventListener('input', listener);
    }
  },
);

onMounted(() => {
  nextTick(async () => {
    await initEditor();
  });
});

onBeforeUnmount(async () => {
  await destroyEditor();
});

defineExpose({
  getData: async () => {
    if (!crepe.value || !isMounted.value || isDestroyed.value) {
      console.warn('Editor not initialized or destroyed');
      return null;
    }
    try {
      return crepe.value.getMarkdown();
    } catch (err) {
      console.error('Failed to get editor data:', err);
      return null;
    }
  },
  clear: async () => {
    if (!crepe.value || !isMounted.value || isDestroyed.value) {
      console.warn('Editor not initialized or destroyed');
      return;
    }
    try {
      await destroyEditor();
      isDestroyed.value = false;
      await nextTick();
      await initEditor();
      emit('update:modelValue', '');
    } catch (err) {
      console.error('Failed to clear editor:', err);
    }
  },
});
</script>

<style>
.milkdown-editor-container {
  padding: 10px;
  position: relative;
  z-index: 0;
}

.milkdown-editor {
  position: relative;
  z-index: 0;
}

.milkdown-editor-error {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 8px;
  padding: 0 16px;
}

/* Темная тема для Milkdown */
.milkdown-editor-container.milkdown-editor--dark .milkdown {
  background: transparent;
  color: white;
}
.milkdown .ProseMirror {
    padding: 0px 60px !important;
}

/* На мобильных устройствах убираем боковые отступы */
@media (max-width: 768px) {
    .milkdown .ProseMirror {
        padding: 0px 0px !important;
    }
}

</style>
