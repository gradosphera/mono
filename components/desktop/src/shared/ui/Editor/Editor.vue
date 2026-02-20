<template>
  <div class="easymde-editor-container"
    :class="{
      'easymde-editor--readonly': readonly,
      'easymde-editor--dark': isDark,
      'easymde-editor--padded': padded,
      'easymde-editor--focused': isFocused
    }"
    :style="editorContainerStyle">
    <textarea ref="textareaRef"></textarea>
    <div v-if="error" class="easymde-editor-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, getCurrentInstance } from 'vue';
import 'easymde/dist/easymde.min.css';

interface Props {
  modelValue: string | null | undefined;
  readonly?: boolean;
  placeholder?: string;
  minHeight?: number;
  padded?: boolean;
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
  padded: true,
});

const emit = defineEmits<Emits>();

const instance = getCurrentInstance();
const { $q } = instance?.proxy as any;
const isDark = computed(() => $q?.dark?.isActive || false);

const editorContainerStyle = computed(() => {
  return props.minHeight ? { minHeight: `${props.minHeight}px` } : {};
});

const textareaRef = ref<HTMLTextAreaElement>();
const easymde = ref<any>();
const error = ref<string>('');
const isInternalChange = ref(false);
const isFocused = ref(false);

const initEditor = async () => {
  if (typeof window === 'undefined') return;
  if (!textareaRef.value) return;
  if (easymde.value) return;

  try {
    const { default: EasyMDE } = await import('easymde');
    const editor = new EasyMDE({
      element: textareaRef.value,
      initialValue: props.modelValue || '',
      placeholder: props.placeholder,
      spellChecker: false,
      toolbar: false, // Отключаем верхний тулбар
      status: false, // Отключаем нижний статус-бар
      hideIcons: ['side-by-side', 'fullscreen', 'guide'], // Скрываем иконки
      autoDownloadFontAwesome: false,
      minHeight: props.minHeight ? `${props.minHeight}px` : undefined,
      renderingConfig: {
        codeSyntaxHighlighting: true,
      },
    });

    easymde.value = editor;

    // Устанавливаем режим только для чтения, если нужно
    if (props.readonly) {
      editor.codemirror.setOption('readOnly', true);
    }

    // Слушаем изменения в редакторе
    editor.codemirror.on('change', () => {
      if (props.readonly) return;

      isInternalChange.value = true;
      const markdown = editor.value();
      emit('update:modelValue', markdown);
      emit('change');

      nextTick(() => {
        isInternalChange.value = false;
      });
    });

    // Слушаем фокус
    editor.codemirror.on('focus', () => {
      if (props.readonly) return;
      isFocused.value = true;
    });

    editor.codemirror.on('blur', () => {
      isFocused.value = false;
    });

    emit('ready');
    console.log('EasyMDE editor created');
  } catch (err) {
    error.value = 'Ошибка инициализации редактора';
    console.error('EasyMDE initialization failed:', err);
  }
};

const destroyEditor = () => {
  if (easymde.value) {
    try {
      easymde.value.toTextArea();
      easymde.value = undefined;
      console.log('EasyMDE editor destroyed');
    } catch (err) {
      console.error('Editor destruction failed:', err);
    }
  }
};

// Следим за изменениями modelValue извне
watch(
  () => props.modelValue,
  (newValue) => {
    // Игнорируем изменения, которые произошли из-за ввода пользователя
    if (isInternalChange.value) return;
    if (!easymde.value) return;

    try {
      const currentValue = easymde.value.value();
      if (newValue !== currentValue) {
        easymde.value.value(newValue || '');
      }
    } catch (err) {
      console.error('Failed to update editor content:', err);
    }
  },
);

// Следим за изменениями readonly
watch(
  () => props.readonly,
  (newReadonly) => {
    if (!easymde.value) return;
    try {
      easymde.value.codemirror.setOption('readOnly', newReadonly);
    } catch (err) {
      console.error('Failed to toggle readonly mode:', err);
    }
  },
);

// Следим за изменениями placeholder
watch(
  () => props.placeholder,
  async () => {
    if (!easymde.value) return;
    try {
      // Для обновления плейсхолдера нужно пересоздать редактор
      const currentValue = easymde.value.value();
      destroyEditor();
      await nextTick();
      await initEditor();
      if (easymde.value) {
        easymde.value.value(currentValue);
      }
    } catch (err) {
      console.error('Failed to update placeholder:', err);
    }
  },
);

onMounted(async () => {
  await nextTick();
  await initEditor();
});

onBeforeUnmount(() => {
  destroyEditor();
});

defineExpose({
  getData: () => {
    if (!easymde.value) {
      console.warn('Editor not initialized');
      return null;
    }
    try {
      return easymde.value.value();
    } catch (err) {
      console.error('Failed to get editor data:', err);
      return null;
    }
  },
  clear: () => {
    if (!easymde.value) {
      console.warn('Editor not initialized');
      return;
    }
    try {
      easymde.value.value('');
      emit('update:modelValue', '');
    } catch (err) {
      console.error('Failed to clear editor:', err);
    }
  },
});
</script>

<style>
.easymde-editor-container {
  padding: 10px;
  position: relative;
  z-index: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.easymde-editor-container.easymde-editor--focused {
  border-color: var(--q-primary);
  box-shadow: 0 0 4px var(--q-primary);
}

.easymde-editor-error {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 8px;
  padding: 0 16px;
}

/* Базовые стили EasyMDE */
.easymde-editor-container.easymde-editor--padded .EasyMDEContainer {
  padding: 0px 60px;
}

.easymde-editor-container:not(.easymde-editor--padded) .EasyMDEContainer {
  padding: 0px;
}

/* На мобильных устройствах убираем боковые отступы */
@media (max-width: 768px) {
  .easymde-editor-container .EasyMDEContainer {
    padding: 0px;
  }
}

/* Темная тема для EasyMDE */
.body--dark .easymde-editor-container .CodeMirror {
  background: transparent;
  color: #d4d4d4;
}

.body--dark .easymde-editor-container:not(.easymde-editor--readonly) .CodeMirror-cursor {
  border-left: 2px solid var(--q-primary) !important;
}

.easymde-editor-container.easymde-editor--readonly .CodeMirror-cursor {
  display: none !important;
}

.body--dark .easymde-editor-container .CodeMirror-selected {
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.3) !important;
}

.body--dark .easymde-editor-container .cm-header {
  color: #569cd6;
}

.body--dark .easymde-editor-container .cm-quote {
  color: #6a9955;
}

.body--dark .easymde-editor-container .cm-link {
  color: #4ec9b0;
}

.body--dark .easymde-editor-container .cm-url {
  color: #3794ff;
}

.body--dark .easymde-editor-container .cm-strong {
  color: #d4d4d4;
  font-weight: bold;
}

.body--dark .easymde-editor-container .cm-em {
  color: #d4d4d4;
  font-style: italic;
}

.body--dark .easymde-editor-container .cm-code {
  color: #ce9178;
  background: transparent;
}

.body--dark .easymde-editor-container .CodeMirror-placeholder {
  color: #6a6a6a;
}

/* Светлая тема */
.easymde-editor-container .CodeMirror {
  border: none !important;
}

.easymde-editor-container:not(.easymde-editor--readonly) .CodeMirror-cursor {
  border-left: 2px solid var(--q-primary) !important;
}

.easymde-editor-container.easymde-editor--readonly .CodeMirror-cursor {
  display: none !important;
}

.easymde-editor-container .CodeMirror-selected {
  background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.2) !important;
}

/* Стили для inline кода (одиночные обратные кавычки) */
.easymde-editor-container .CodeMirror-line .cm-comment:not(.cm-formatting-code-block) {
  color: #d73a49;
  background: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.easymde-editor-container.easymde-editor--dark .CodeMirror-line .cm-comment:not(.cm-formatting-code-block) {
  color: #f87171;
  background: #374151;
}

/* Стили для кодовых блоков (тройные обратные кавычки) */
.easymde-editor-container .cm-comment.cm-formatting-code-block {
  color: #6a737d;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  background: #f6f8fa;
  padding-left: 8px;
  border-left: 3px solid #e1e4e8;
}

.easymde-editor-container.easymde-editor--dark .cm-comment.cm-formatting-code-block {
  color: #8b949e;
  background: #2d3748;
  border-left: 3px solid #4a5568;
}

/* Скрываем режим предпросмотра, если он случайно включится */
.easymde-editor-container .editor-preview-side,
.easymde-editor-container .editor-preview-active-side,
.easymde-editor-container .editor-preview {
  display: none !important;
}

/* Убираем меню при выборе текста */
.easymde-editor-container .CodeMirror-hints {
  display: none !important;
}
</style>
