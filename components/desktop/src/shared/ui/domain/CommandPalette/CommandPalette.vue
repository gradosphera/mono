<template lang="pug">
q-dialog(
  :model-value='modelValue',
  position='top',
  @update:model-value='(v) => emit("update:modelValue", v)',
  @show='onShow',
  @hide='onHide'
)
  .command-palette(role='combobox', :aria-expanded='modelValue')
    .command-palette__search
      q-icon.command-palette__search-icon(name='search', size='18px')
      input.command-palette__input(
        ref='inputRef',
        v-model='query',
        type='text',
        :placeholder='placeholder ?? "Поиск страниц, действий, недавних…"',
        autocomplete='off',
        spellcheck='false',
        @keydown.down.prevent='moveSelection(1)',
        @keydown.up.prevent='moveSelection(-1)',
        @keydown.enter.prevent='executeActive'
      )
      kbd.command-palette__esc Esc

    template(v-if='flatFiltered.length')
      .command-palette__results
        .command-palette__section(v-for='group in groupedFiltered', :key='group.section')
          .command-palette__section-title {{ sectionLabels[group.section] }}
          ul.command-palette__list(role='listbox')
            li.command-palette__item(
              v-for='item in group.items',
              :key='item.key',
              :class='{ "is-active": item.flatIndex === activeIndex }',
              role='option',
              :aria-selected='item.flatIndex === activeIndex',
              @click='runCommand(item)',
              @mouseenter='activeIndex = item.flatIndex'
            )
              q-icon.command-palette__item-icon(v-if='item.icon', :name='item.icon', size='18px')
              span.command-palette__item-icon-spacer(v-else)
              span.command-palette__item-label {{ item.label }}
              kbd.command-palette__hotkey(v-if='item.hotkey') {{ item.hotkey }}

    .command-palette__empty(v-else)
      EmptyState(title='Ничего не нашлось', body='Попробуйте другой запрос')

    footer.command-palette__footer
      span.command-palette__hint
        kbd ↑
        kbd ↓
        | навигация
      span.command-palette__hint
        kbd ↵
        | выбрать
      span.command-palette__hint
        kbd Esc
        | закрыть
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import type { CommandItem, CommandPaletteProps, CommandSection } from './CommandPalette.types';

const props = defineProps<CommandPaletteProps>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const query = ref('');
const activeIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const SECTION_ORDER: CommandSection[] = ['recent', 'pages', 'actions'];

const sectionLabels: Record<CommandSection, string> = {
  recent: 'Недавние',
  pages: 'Страницы',
  actions: 'Действия',
};

function fuzzyMatch(label: string, q: string): boolean {
  if (!q) return true;
  const haystack = label.toLowerCase();
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  if (haystack.includes(needle)) return true;
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) {
      i += 1;
      if (i === needle.length) return true;
    }
  }
  return false;
}

interface FlatItem extends CommandItem {
  flatIndex: number;
}

const flatFiltered = computed<FlatItem[]>(() => {
  const filtered = props.commands.filter((c) => fuzzyMatch(c.label, query.value));
  const order = (a: CommandItem, b: CommandItem): number =>
    SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section);
  return filtered.slice().sort(order).map((c, idx) => ({ ...c, flatIndex: idx }));
});

const groupedFiltered = computed(() => {
  const byCategory = new Map<CommandSection, FlatItem[]>();
  for (const item of flatFiltered.value) {
    const list = byCategory.get(item.section) ?? [];
    list.push(item);
    byCategory.set(item.section, list);
  }
  return SECTION_ORDER
    .filter((s) => byCategory.has(s))
    .map((s) => ({ section: s, items: byCategory.get(s) ?? [] }));
});

watch(query, () => {
  activeIndex.value = 0;
});

watch(
  () => props.modelValue,
  (next) => {
    if (next) {
      query.value = '';
      activeIndex.value = 0;
    }
  },
);

function moveSelection(delta: number): void {
  const total = flatFiltered.value.length;
  if (!total) return;
  const next = (activeIndex.value + delta + total) % total;
  activeIndex.value = next;
}

function executeActive(): void {
  const item = flatFiltered.value[activeIndex.value];
  if (!item) return;
  runCommand(item);
}

function runCommand(item: FlatItem): void {
  emit('update:modelValue', false);
  nextTick(() => {
    item.action();
  });
}

function onShow(): void {
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function onHide(): void {
  query.value = '';
  activeIndex.value = 0;
}
</script>

<style scoped>
.command-palette {
  display: flex;
  flex-direction: column;
  width: min(640px, 92vw);
  margin-top: 64px;
  background: var(--p-surface);
  color: var(--p-ink);
  border-radius: var(--p-r-md, 12px);
  box-shadow: var(--p-elev-3);
  overflow: hidden;
}

.command-palette__search {
  display: flex;
  align-items: center;
  gap: var(--p-2, 8px);
  padding: var(--p-3, 12px) var(--p-4, 16px);
  border-bottom: 1px solid var(--p-line);
}

.command-palette__search-icon {
  color: var(--p-ink-3);
  flex: 0 0 auto;
}

.command-palette__input {
  flex: 1 1 auto;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--p-ink);
  font-size: var(--p-fs-h6, 16px);
  line-height: var(--p-lh-h6, 1.4);
  font-family: inherit;
}
.command-palette__input::placeholder {
  color: var(--p-ink-3);
}

.command-palette__esc {
  padding: 2px 6px;
  border: 1px solid var(--p-line);
  border-radius: 4px;
  background: var(--p-surface-2);
  color: var(--p-ink-3);
  font-family: var(--p-mono);
  font-size: var(--p-fs-caption, 11px);
  font-weight: 500;
}

.command-palette__results {
  overflow-y: auto;
  max-height: 420px;
  padding: var(--p-2, 8px) 0;
}

.command-palette__section + .command-palette__section {
  margin-top: var(--p-2, 8px);
}

.command-palette__section-title {
  padding: var(--p-2, 8px) var(--p-4, 16px) var(--p-1, 4px);
  font-size: var(--p-fs-caption, 12px);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-ink-3);
}

.command-palette__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.command-palette__item {
  display: flex;
  align-items: center;
  gap: var(--p-3, 12px);
  padding: var(--p-2, 8px) var(--p-4, 16px);
  cursor: pointer;
  color: var(--p-ink);
  font-size: var(--p-fs-body, 14px);
  line-height: var(--p-lh-body, 1.5);
  transition: background var(--p-dur-fast, 120ms) var(--p-ease-standard);
}
.command-palette__item.is-active,
.command-palette__item:hover {
  background: var(--p-surface-2);
}
.command-palette__item.is-active {
  outline: 2px solid var(--p-primary);
  outline-offset: -2px;
}

.command-palette__item-icon {
  color: var(--p-ink-2);
  flex: 0 0 auto;
}
.command-palette__item-icon-spacer {
  display: inline-block;
  width: 18px;
  flex: 0 0 auto;
}

.command-palette__item-label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.command-palette__hotkey {
  padding: 2px 6px;
  border: 1px solid var(--p-line);
  border-radius: 4px;
  background: var(--p-surface-2);
  color: var(--p-ink-2);
  font-family: var(--p-mono);
  font-size: var(--p-fs-caption, 11px);
  font-weight: 500;
  flex: 0 0 auto;
}

.command-palette__empty {
  padding: var(--p-6, 24px) var(--p-4, 16px);
}

.command-palette__footer {
  display: flex;
  align-items: center;
  gap: var(--p-4, 16px);
  padding: var(--p-2, 8px) var(--p-4, 16px);
  border-top: 1px solid var(--p-line);
  font-size: var(--p-fs-caption, 12px);
  color: var(--p-ink-3);
}

.command-palette__hint {
  display: inline-flex;
  align-items: center;
  gap: var(--p-1, 4px);
}
.command-palette__hint kbd {
  padding: 2px 6px;
  border: 1px solid var(--p-line);
  border-radius: 4px;
  background: var(--p-surface-2);
  color: var(--p-ink-2);
  font-family: var(--p-mono);
  font-size: var(--p-fs-caption, 11px);
  font-weight: 500;
}
</style>
