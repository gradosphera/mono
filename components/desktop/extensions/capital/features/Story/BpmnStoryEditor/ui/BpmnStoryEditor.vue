<template lang="pug">
.bpmn-story-editor(
  ref="rootEl"
  :class="{ 'bpmn-story-editor--app-dark': isAppDark }"
  :style="rootStyle"
)
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, onMounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { EMPTY_BPMN_STORY_XML, decodeBpmnXmlIfEscaped } from 'app/extensions/capital/shared/lib';

const $q = useQuasar();
const isAppDark = computed(() => $q.dark.isActive);

interface BpmnToolkit {
  destroy: () => void;
  importXML: (xml: string) => Promise<unknown>;
  on: (event: string, fn: () => void) => void;
  off?: (event: string, fn: () => void) => void;
  saveXML: (options: { format?: boolean }) => Promise<{ xml?: string }>;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    readonly?: boolean;
    minHeight?: number;
  }>(),
  {
    readonly: false,
    minHeight: 400,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const rootEl = ref<HTMLElement | null>(null);
const toolkit = ref<BpmnToolkit | null>(null);
const internalXml = ref(props.modelValue || EMPTY_BPMN_STORY_XML);
let suppressXmlEmit = false;

const rootStyle = computed(() => ({
  minHeight: `${props.minHeight}px`,
  height: '100%',
}));

async function loadStyles(): Promise<void> {
  await import('bpmn-js/dist/assets/diagram-js.css');
  await import('bpmn-js/dist/assets/bpmn-font/css/bpmn.css');
}

async function initToolkit(): Promise<void> {
  const el = rootEl.value;
  if (!el || typeof window === 'undefined') return;

  await loadStyles();

  const xml = props.modelValue?.trim() ? props.modelValue : EMPTY_BPMN_STORY_XML;
  internalXml.value = xml;

  if (props.readonly) {
    const { default: NavigatedViewer } = await import('bpmn-js/lib/NavigatedViewer');
    const viewer = new NavigatedViewer({ container: el }) as unknown as BpmnToolkit;
    toolkit.value = viewer;
    suppressXmlEmit = true;
    try {
      await viewer.importXML(xml);
    } finally {
      suppressXmlEmit = false;
    }
    return;
  }

  const { default: BpmnModeler } = await import('bpmn-js/lib/Modeler');
  const modeler = new BpmnModeler({ container: el }) as unknown as BpmnToolkit;
  toolkit.value = modeler;

  const onChange = (): void => {
    if (props.readonly || suppressXmlEmit) return;
    void modeler.saveXML({ format: true }).then(({ xml: out }) => {
      if (out === undefined) return;
      if (out === internalXml.value) return;
      internalXml.value = out;
      emit('update:modelValue', out);
    });
  };

  modeler.on('commandStack.changed', onChange);
  suppressXmlEmit = true;
  try {
    await modeler.importXML(xml);
  } finally {
    suppressXmlEmit = false;
  }
}

function destroyToolkit(): void {
  const t = toolkit.value;
  if (t) {
    t.destroy();
    toolkit.value = null;
  }
}

onMounted(() => {
  void initToolkit();
});

onBeforeUnmount(() => {
  destroyToolkit();
});

watch(
  () => props.readonly,
  async () => {
    destroyToolkit();
    await nextTick();
    void initToolkit();
  },
);

watch(
  () => props.modelValue,
  async (next) => {
    const t = toolkit.value;
    if (!t) return;
    const raw = next?.trim() ? next : EMPTY_BPMN_STORY_XML;
    const normalized = decodeBpmnXmlIfEscaped(raw);
    if (normalized === internalXml.value) return;
    internalXml.value = normalized;
    suppressXmlEmit = true;
    try {
      await t.importXML(normalized);
    } finally {
      suppressXmlEmit = false;
    }
  },
);
</script>

<style lang="scss" scoped>
/* bpmn-js рассчитан на светлую схему; при body--dark Quasar даёт светлый color — наследуется
   direct-editing (contenteditable) → невидимый текст на светлом холсте. */
.bpmn-story-editor {
  --bpmn-story-fg: hsl(225, 10%, 15%);

  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  color: var(--bpmn-story-fg);
  color-scheme: light;
  isolation: isolate;

  &.bpmn-story-editor--app-dark {
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
  }

  :deep(.djs-container) {
    height: 100%;
    min-height: inherit;
  }

  :deep([contenteditable='true']) {
    color: var(--bpmn-story-fg) !important;
    caret-color: var(--bpmn-story-fg);
  }

  :deep(textarea),
  :deep(input[type='text']),
  :deep(input[type='search']) {
    color: var(--bpmn-story-fg);
    caret-color: var(--bpmn-story-fg);
  }
}

</style>
