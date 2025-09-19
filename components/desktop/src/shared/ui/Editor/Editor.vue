<template>
  <div class="editor-container" :class="{ 'editor--readonly': readonly }">
    <div ref="editorRef" id="editorRef" class="editor"></div>
    <div v-if="error" class="editor-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';

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
  minHeight: 200,
});

const emit = defineEmits<Emits>();

const editorRef = ref<HTMLDivElement>();
const editor = ref<EditorJS>();
const error = ref<string>('');
const isMounted = ref(false);
const isDestroyed = ref(false);

// Простой debounce для предотвращения слишком частых обновлений
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

const initEditor = async () => {
  if (!editorRef.value) {
    console.error('Editor container not found');
    return;
  }

  // Убедимся, что элемент в DOM
  if (!document.contains(editorRef.value)) {
    console.error('Editor container not in DOM');
    return;
  }

  // Предотвратим повторную инициализацию
  if (editor.value || isDestroyed.value) {
    console.log('Editor already initialized or being destroyed');
    return;
  }

  isMounted.value = true;

  try {

    const initialData = JSON.parse(props.modelValue || '{}');

    editor.value = new EditorJS({
      holder: editorRef.value,
      // Передаем данные только если есть реальные блоки, иначе EditorJS инициализируется пустым
      ...(initialData && initialData.blocks && initialData.blocks.length > 0 && { data: initialData }),
      readOnly: props.readonly,
      placeholder: props.placeholder,
      minHeight: props.minHeight,
      tools: {
        header: Header,
        list: {
          class: List,
          inlineToolbar: true,
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Введите цитату',
            captionPlaceholder: 'Подпись к цитате',
          }
        },
        code: {
          class: Code,
          inlineToolbar: true,
        },
        inlineCode: {
          class: InlineCode,
          inlineToolbar: true,
        },
        marker: {
          class: Marker,
          inlineToolbar: true,
        },
      },
      onChange: async () => {
        if (props.readonly || !isMounted.value || isDestroyed.value) return;

        // Дополнительная проверка существования DOM элемента
        if (!editorRef.value || !document.contains(editorRef.value)) {
          console.warn('Editor DOM element not found during onChange');
          return;
        }

        try {
          if (editor.value) {
            const outputData = await editor.value.save();
            const jsonString = JSON.stringify(outputData);


            emit('update:modelValue', jsonString);
            emit('change');
          }
        } catch (err) {
          console.error('Saving failed:', err);
          // В случае ошибки сохранения, не обновляем modelValue
        }
      },
      onReady: () => {
        console.log('Editor.js is ready to work!');
        emit('ready');
      },
    });
  } catch (err) {
    error.value = 'Ошибка инициализации редактора';
    console.error('Editor initialization failed:', err);
  }
};

const destroyEditor = async () => {
  if (editor.value && !isDestroyed.value) {
    isDestroyed.value = true;

    // Очищаем debounce timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      debounceTimeout = null;
    }

    try {
      await editor.value.destroy();
      console.log('Editor.js destroyed successfully');
    } catch (err) {
      console.error('Editor destruction failed:', err);
    } finally {
      editor.value = undefined;
      isMounted.value = false;
    }
  }
};

watch(
  () => props.readonly,
  async (newReadonly) => {
    if (!editor.value || !isMounted.value || isDestroyed.value) return;

    // Проверяем, что DOM элемент все еще существует
    if (!editorRef.value || !document.contains(editorRef.value)) return;

    try {
      if (newReadonly) {
        await editor.value.readOnly.toggle(true);
      } else {
        await editor.value.readOnly.toggle(false);
      }
    } catch (err) {
      console.error('Failed to toggle readonly mode:', err);
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
    if (!editor.value || !isMounted.value || isDestroyed.value) {
      console.warn('Editor not initialized or destroyed');
      return null;
    }
    try {
      return await editor.value.save();
    } catch (err) {
      console.error('Failed to get editor data:', err);
      return null;
    }
  },
  clear: async () => {
    if (!editor.value || !isMounted.value || isDestroyed.value) {
      console.warn('Editor not initialized or destroyed');
      return;
    }
    try {
      await editor.value.clear();
      emit('update:modelValue', '');
    } catch (err) {
      console.error('Failed to clear editor:', err);
    }
  },
});
</script>

<style>
.editor-container {
  border-radius: 4px;
  min-height: 200px;
}

/* .editor-container.editor--readonly {
  background-color: #f5f5f5;
} */

.editor {
  min-height: 200px;
  /* padding: 16px; */
}

.codex-editor__redactor{
  padding-bottom: 0px !important;
}

.editor-error {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 8px;
  padding: 0 16px;
}
</style>
