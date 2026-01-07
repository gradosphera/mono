<template>
  <div class="editor-container" :class="{ 'editor--readonly': readonly, 'editor--dark': isDark }" :style="editorContainerStyle" @click="handleContainerClick">
    <!-- SSR контент для SEO -->
    <div v-if="!isClientReady" class="editor-ssr-content" v-html="ssrContent"></div>
    <!-- Интерактивный редактор для клиента -->
    <div v-else ref="editorRef" id="editorRef" class="editor"></div>
    <div v-if="error" class="editor-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, getCurrentInstance } from 'vue';

// Динамические импорты только для клиента
let EditorJS: any = null;
let Header: any = null;
let List: any = null;
let Quote: any = null;
let Code: any = null;
let InlineCode: any = null;
let Marker: any = null;

// Функция для загрузки EditorJS на клиенте
const loadEditorJS = async () => {
  if (typeof window === 'undefined') return; // SSR guard

  const [
    { default: EditorJSModule },
    { default: HeaderModule },
    { default: ListModule },
    { default: QuoteModule },
    { default: CodeModule },
    { default: InlineCodeModule },
    { default: MarkerModule }
  ] = await Promise.all([
    import('@editorjs/editorjs'),
    import('@editorjs/header'),
    import('@editorjs/list'),
    import('@editorjs/quote'),
    import('@editorjs/code'),
    import('@editorjs/inline-code'),
    import('@editorjs/marker')
  ]);

  EditorJS = EditorJSModule;
  Header = HeaderModule;
  List = ListModule;
  Quote = QuoteModule;
  Code = CodeModule;
  InlineCode = InlineCodeModule;
  Marker = MarkerModule;
};

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
const editor = ref<any>();
const error = ref<string>('');
const isMounted = ref(false);
const isDestroyed = ref(false);
const isClientReady = ref(false);

// SSR контент для SEO
const ssrContent = computed(() => {
  if (!props.modelValue) return '';

  try {
    const data = JSON.parse(props.modelValue);
    if (!data.blocks || !Array.isArray(data.blocks)) return '';

    // Преобразуем блоки EditorJS в HTML для SEO
    return data.blocks.map((block: any) => {
      switch (block.type) {
        case 'header':
          const level = block.data?.level || 2;
          return `<h${level}>${block.data?.text || ''}</h${level}>`;
        case 'paragraph':
          return `<p>${block.data?.text || ''}</p>`;
        case 'list':
          const listTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
          const items = block.data?.items?.map((item: string) => `<li>${item}</li>`).join('') || '';
          return `<${listTag}>${items}</${listTag}>`;
        case 'quote':
          const caption = block.data?.caption ? `<cite>${block.data.caption}</cite>` : '';
          return `<blockquote>${block.data?.text || ''}${caption}</blockquote>`;
        case 'code':
          return `<pre><code>${block.data?.code || ''}</code></pre>`;
        default:
          return block.data?.text || '';
      }
    }).join('');
  } catch (err) {
    console.warn('Failed to parse editor data for SSR:', err);
    return '';
  }
});

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
    // Получаем все блоки редактора из DOM
    const blockElements = editorElement?.querySelectorAll('.ce-block') as NodeListOf<HTMLElement>;
    if (!blockElements || blockElements.length === 0) {
      // Если блоков нет, фокусируемся на первом (пустом) блоке
      if (editor.value && (editor.value as any).focus) {
        (editor.value as any).focus(0);
      }
      return;
    }

    const clickY = event.clientY;
    let closestIndex = 0;
    let minDistance = Infinity;

    // Проходим по всем блокам и находим ближайший к месту клика
    blockElements.forEach((blockElement, index) => {
      const blockRect = blockElement.getBoundingClientRect();
      const blockCenterY = blockRect.top + blockRect.height / 2;
      const distance = Math.abs(clickY - blockCenterY);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Устанавливаем фокус на ближайший блок
    if (editor.value && (editor.value as any).focus) {
      (editor.value as any).focus(closestIndex);
    }

  } catch (err) {
    console.error('Failed to handle container click:', err);
  }
};

const initEditor = async () => {
  // Проверяем, что мы на клиенте
  if (typeof window === 'undefined') return;

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

  // Загружаем EditorJS если еще не загружен
  if (!EditorJS) {
    await loadEditorJS();
  }

  // Проверяем что EditorJS загрузился
  if (!EditorJS) {
    console.error('Failed to load EditorJS');
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
  // Устанавливаем флаг готовности клиента
  isClientReady.value = true;

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
/* .body--light .editor-container {
  background: rgb(246, 247, 249);
}

.body--dark .editor-container {
  background: rgb(40, 39, 39);
  color: white;
} */

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

.editor-ssr-content {
  min-height: 24px;
}

.editor-ssr-content h1,
.editor-ssr-content h2,
.editor-ssr-content h3,
.editor-ssr-content h4,
.editor-ssr-content h5,
.editor-ssr-content h6 {
  margin: 16px 0 8px 0;
  font-weight: 600;
}

.editor-ssr-content h1 { font-size: 2em; }
.editor-ssr-content h2 { font-size: 1.5em; }
.editor-ssr-content h3 { font-size: 1.17em; }
.editor-ssr-content h4 { font-size: 1em; }
.editor-ssr-content h5 { font-size: 0.83em; }
.editor-ssr-content h6 { font-size: 0.67em; }

.editor-ssr-content p {
  margin: 8px 0;
  line-height: 1.5;
}

.editor-ssr-content ul,
.editor-ssr-content ol {
  margin: 8px 0;
  padding-left: 24px;
}

.editor-ssr-content li {
  margin: 4px 0;
  line-height: 1.4;
}

.editor-ssr-content blockquote {
  margin: 16px 0;
  padding-left: 16px;
  border-left: 4px solid #ccc;
  font-style: italic;
}

.editor-ssr-content pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin: 8px 0;
  overflow-x: auto;
}

.editor-ssr-content code {
  font-family: 'Courier New', monospace;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 2px;
}

/* Темная тема для SSR контента */
.body--dark .editor-ssr-content blockquote {
  border-left-color: #555;
}

.body--dark .editor-ssr-content pre {
  background: #333;
  color: #fff;
}

.body--dark .editor-ssr-content code {
  background: #333;
  color: #fff;
}

/* Стили для inline toolbar EditorJS в тёмной теме */
.editor-container.editor--dark .ce-inline-toolbar {
  background: #333 !important;
  border: 1px solid #555 !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.editor-container.editor--dark .ce-inline-toolbar .ce-toolbar__content {
  background: #333 !important;
}

.editor-container.editor--dark .ce-inline-toolbar .ce-toolbox {
  background: #333 !important;
}

.editor-container.editor--dark .ce-inline-toolbar .ce-toolbox__toggler {
  background: #333 !important;
  color: #fff !important;
  border-color: #555 !important;
}

.editor-container.editor--dark .ce-inline-toolbar .ce-toolbox__toggler:hover {
  background: #444 !important;
}

.editor-container.editor--dark .ce-inline-toolbar .ce-toolbox .ce-toolbox-button {
  color: #fff !important;
}

.editor-container.editor--dark .ce-inline-toolbar .ce-toolbox .ce-toolbox-button:hover {
  background: #444 !important;
}

.ce-toolbar__plus .editor-container.editor--dark .ce-inline-toolbar .ce-toolbox .ce-toolbox-button--active {
  background: #555 !important;
  color: #fff !important;
}
/* Стили для тулбаров EditorJS в тёмной теме */
.editor-container.editor--dark .ce-toolbar__plus {
  color: #fff !important;
}
.editor-container.editor--dark .ce-toolbar__settings-btn {
  color: #fff !important;
}
</style>
