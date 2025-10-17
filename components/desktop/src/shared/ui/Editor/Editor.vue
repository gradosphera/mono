<template>
  <div class="editor-container" :class="{ 'editor--readonly': readonly }" :style="editorContainerStyle" @click="handleContainerClick">
    <div ref="editorRef" id="editorRef" class="editor"></div>
    <div v-if="error" class="editor-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue';
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
  minHeight: 0,
});

const emit = defineEmits<Emits>();

const editorContainerStyle = computed(() => {
  return props.minHeight ? { minHeight: `${props.minHeight}px` } : {};
});

const editorRef = ref<HTMLDivElement>();
const editor = ref<EditorJS>();
const error = ref<string>('');
const isMounted = ref(false);
const isDestroyed = ref(false);

// Убрали debouncing - данные обновляются немедленно для корректной работы валидации форм

const handleContainerClick = async (event: MouseEvent) => {
  // Не обрабатываем клик если редактор в режиме чтения
  if (props.readonly || !editor.value || !isMounted.value || isDestroyed.value) {
    return;
  }

  // Проверяем, что клик был именно на контейнере, а не на внутреннем контенте редактора
  const target = event.target as HTMLElement;
  const editorElement = editorRef.value;
  if (target !== event.currentTarget && editorElement && editorElement.contains(target)) {
    return;
  }

  try {
    // Получаем текущие данные редактора
    const currentData = await editor.value.save();

    // Определяем позицию вставки на основе клика
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clickY = event.clientY - rect.top;
    const containerHeight = rect.height;

    // Если клик в верхней половине - вставляем в начало, иначе - в конец
    const insertIndex = clickY < containerHeight / 2 ? 0 : (currentData.blocks?.length || 0);

    // Вставляем новый параграф в выбранную позицию
    if (editor.value && (editor.value as any).blocks?.insert) {
      await (editor.value as any).blocks.insert('paragraph', { text: '' }, insertIndex);

      // Фокусируем вставленный блок
      setTimeout(() => {
        if (editor.value && (editor.value as any).focus) {
          (editor.value as any).focus(insertIndex);
        }
      }, 50);
    }

  } catch (err) {
    console.error('Failed to handle container click:', err);
  }
};

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

    // Если данных нет или они пустые, инициализируем с одним пустым параграфом
    const editorData = (initialData && initialData.blocks && initialData.blocks.length > 0)
      ? initialData
      : {
          blocks: [
            {
              type: 'paragraph',
              data: { text: '' }
            }
          ]
        };

    editor.value = new EditorJS({
      holder: editorRef.value,
      data: editorData,
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

            // Фильтруем данные: если остался только один пустой параграф (добавленный при инициализации), сохраняем пустую строку
            const filteredData = (outputData.blocks && outputData.blocks.length === 1 &&
                                 outputData.blocks[0].type === 'paragraph' &&
                                 (!outputData.blocks[0].data?.text || outputData.blocks[0].data.text.trim() === ''))
              ? { blocks: [] }
              : outputData;

            const jsonString = JSON.stringify(filteredData);

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
.body--light .editor-container {
  background: rgb(246, 247, 249);
}

.body--dark .editor-container {
  background: rgb(40, 39, 39);
  color: white;
}

.editor-container {
  padding: 10px;
  cursor: text;
  position: relative;
  z-index: 0;
}

.editor-container .editor {
  position: relative;
  z-index: 0;
}

/* .editor-container.editor--readonly {
  background-color: #f5f5f5;
} */

/* .editor { */
  /* padding: 16px; */
/* } */

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
