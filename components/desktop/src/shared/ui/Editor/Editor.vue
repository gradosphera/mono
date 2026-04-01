<template>
  <div
    class="easymde-editor-container"
    :class="{
      'easymde-editor--readonly': readonly,
      'easymde-editor--dark': isDark,
      'easymde-editor--padded': padded,
      'easymde-editor--focused': showFocusRing && isFocused,
    }"
    :style="editorContainerStyle"
  >
    <div ref="editorRef" class="milkdown-editor-root"></div>
    <div v-if="error" class="easymde-editor-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
  computed,
  getCurrentInstance,
} from 'vue';
import type { Crepe } from '@milkdown/crepe';
import { sanitizeEditorMarkdown } from 'src/shared/lib/utils/sanitizeEditorMarkdown';

interface Props {
  modelValue: string | null | undefined;
  readonly?: boolean;
  placeholder?: string;
  minHeight?: number;
  padded?: boolean;
  /** Рамка при фокусе — для полей внутри форм рядом с q-input и т.п. На полноэкранных страницах описания — false */
  showFocusRing?: boolean;
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
  showFocusRing: false,
});

const emit = defineEmits<Emits>();

const instance = getCurrentInstance();
const quasar = instance?.proxy as { $q?: { dark?: { isActive: boolean } } } | undefined;
const isDark = computed(() => quasar?.$q?.dark?.isActive ?? false);

const editorContainerStyle = computed(() => {
  if (!props.minHeight) return {};
  return { minHeight: `${props.minHeight}px` };
});

const editorRef = ref<HTMLDivElement>();
const crepeRef = ref<Crepe>();
const error = ref<string>('');
const isMounted = ref(false);
const isDestroyed = ref(false);
const isUpdating = ref(false);
const isInternalChange = ref(false);
const isFocused = ref(false);
const currentTheme = ref(isDark.value ? 'frame-dark' : 'frame');

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

const initEditor = async (initialMarkdown?: string) => {
  if (typeof window === 'undefined') return;
  if (!editorRef.value) return;
  if (crepeRef.value || isDestroyed.value) return;

  isMounted.value = true;

  try {
    await import('@milkdown/crepe/theme/common/style.css');
    await loadTheme(currentTheme.value);

    const { Crepe } = await import('@milkdown/crepe');
    const markdown = sanitizeEditorMarkdown(initialMarkdown ?? props.modelValue ?? '');

    const editor = new Crepe({
      root: editorRef.value,
      defaultValue: markdown,
      featureConfigs: {
        placeholder: {
          text: props.placeholder,
          mode: 'block',
        },
      },
    });

    editor.on((listener) => {
      listener.markdownUpdated((_ctx, md) => {
        if (props.readonly || !isMounted.value || isDestroyed.value || isUpdating.value) return;
        const cleaned = sanitizeEditorMarkdown(md);
        try {
          if (cleaned === md) {
            isInternalChange.value = true;
            emit('update:modelValue', md);
            emit('change');
            nextTick(() => {
              isInternalChange.value = false;
            });
          } else {
            emit('update:modelValue', cleaned);
            emit('change');
          }
        } catch (e) {
          isInternalChange.value = false;
          console.error('Editor markdown sync failed:', e);
        }
      });
      listener.focus(() => {
        if (!props.readonly) isFocused.value = true;
      });
      listener.blur(() => {
        isFocused.value = false;
      });
    });

    await editor.create();
    crepeRef.value = editor;

    if (props.readonly) {
      editor.setReadonly(true);
    }

    emit('ready');
    console.log('Milkdown (Crepe) editor created');
  } catch (err) {
    error.value = 'Ошибка инициализации редактора';
    console.error('Milkdown initialization failed:', err);
    isMounted.value = false;
  }
};

const destroyEditor = async () => {
  if (!crepeRef.value || isDestroyed.value) return;
  isDestroyed.value = true;
  try {
    await crepeRef.value.destroy();
    console.log('Milkdown editor destroyed');
  } catch (err) {
    console.error('Editor destruction failed:', err);
  } finally {
    crepeRef.value = undefined;
    isMounted.value = false;
  }
};

watch(
  () => props.modelValue,
  async (newValue) => {
    if (isInternalChange.value) return;
    if (!crepeRef.value || !isMounted.value || isDestroyed.value || isUpdating.value) return;

    try {
      isUpdating.value = true;
      const incoming = sanitizeEditorMarkdown(newValue ?? '');
      const currentValue = crepeRef.value.getMarkdown();
      if (incoming !== currentValue) {
        await destroyEditor();
        isDestroyed.value = false;
        await nextTick();
        await initEditor(incoming);
      }
    } catch (err) {
      console.error('Failed to update editor content:', err);
    } finally {
      isUpdating.value = false;
    }
  },
);

watch(
  () => props.readonly,
  (newReadonly) => {
    if (!crepeRef.value || !isMounted.value || isDestroyed.value) return;
    try {
      crepeRef.value.setReadonly(newReadonly);
    } catch (err) {
      console.error('Failed to toggle readonly mode:', err);
    }
  },
);

watch(
  () => props.placeholder,
  async () => {
    if (!crepeRef.value || !isMounted.value || isDestroyed.value) return;
    try {
      const currentValue = crepeRef.value.getMarkdown();
      await destroyEditor();
      isDestroyed.value = false;
      await nextTick();
      await initEditor(currentValue);
    } catch (err) {
      console.error('Failed to update placeholder:', err);
    }
  },
);

watch(
  isDark,
  async (newIsDark) => {
    const newTheme = newIsDark ? 'frame-dark' : 'frame';
    if (newTheme === currentTheme.value) return;
    currentTheme.value = newTheme;
    if (!crepeRef.value || !isMounted.value || isDestroyed.value) return;
    try {
      const currentValue = crepeRef.value.getMarkdown();
      await destroyEditor();
      isDestroyed.value = false;
      await nextTick();
      await initEditor(currentValue);
    } catch (err) {
      console.error('Failed to switch theme:', err);
    }
  },
);

onMounted(() => {
  void nextTick(async () => {
    await initEditor();
  });
});

onBeforeUnmount(() => {
  void destroyEditor();
});

defineExpose({
  getData: () => {
    if (!crepeRef.value || !isMounted.value || isDestroyed.value) {
      console.warn('Editor not initialized');
      return null;
    }
    try {
      return sanitizeEditorMarkdown(crepeRef.value.getMarkdown());
    } catch (err) {
      console.error('Failed to get editor data:', err);
      return null;
    }
  },
  clear: () => {
    void (async () => {
      if (!crepeRef.value || !isMounted.value || isDestroyed.value) {
        emit('update:modelValue', '');
        return;
      }
      try {
        await destroyEditor();
        isDestroyed.value = false;
        await nextTick();
        await initEditor('');
        emit('update:modelValue', '');
      } catch (err) {
        console.error('Failed to clear editor:', err);
      }
    })();
  },
});
</script>

<style>
.easymde-editor-container {
  padding: 4px;
  position: relative;
  z-index: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  overflow: visible;
}

.easymde-editor-container .milkdown {
  overflow: visible !important;
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

.milkdown-editor-root {
  position: relative;
  z-index: 0;
  overflow: visible;
}

.easymde-editor-container .milkdown .ProseMirror {
  overflow-y: auto;
  outline: none;
}

.easymde-editor-container .milkdown .ProseMirror:focus,
.easymde-editor-container .milkdown .ProseMirror:focus-visible {
  outline: none;
}

/* Левая ручка «+» / drag — не используем, slash-меню оставляем */
.easymde-editor-container .milkdown .milkdown-block-handle {
  display: none !important;
}

/* Slash-меню: без полупрозрачности и с непрозрачным фоном */
.easymde-editor-container .milkdown .milkdown-slash-menu {
  opacity: 1 !important;
}

.body--light .easymde-editor-container .milkdown .milkdown-slash-menu {
  background: #f7f7f7 !important;
}

.body--dark .easymde-editor-container .milkdown .milkdown-slash-menu,
.easymde-editor-container.easymde-editor--dark .milkdown .milkdown-slash-menu {
  background: #2a2a2a !important;
}

.easymde-editor-container.easymde-editor--padded .milkdown .ProseMirror {
  padding: 0 14px !important;
}

.easymde-editor-container:not(.easymde-editor--padded) .milkdown .ProseMirror {
  padding: 0 !important;
}

@media (max-width: 768px) {
  .easymde-editor-container .milkdown .ProseMirror {
    padding: 0 !important;
  }
}

.body--dark .easymde-editor-container .milkdown,
.easymde-editor-container.easymde-editor--dark .milkdown {
  background: transparent;
  color: #d4d4d4;
}
</style>
