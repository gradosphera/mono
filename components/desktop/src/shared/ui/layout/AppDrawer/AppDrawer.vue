<template lang="pug">
aside.rail(role='navigation', aria-label='Главная навигация')
  //- Бренд: иконка + ПК «Название» / подпись расширения
  .rail__top
    slot(name='brand')
      .rail__brand
        slot(name='brand-icon')
          q-icon(name='dashboard')
      .rail__name
        strong {{ coopName ?? 'Кооператив' }}
        span(v-if='coopMeta') {{ coopMeta }}

  //- ⌘K поиск — отдельным блоком после rail__top, выровнен с .rail__nav
  button.rail__cmdk(
    v-if='showCmdk',
    type='button',
    :style='cmdkStyle',
    :title="cmdkHint ?? 'Поиск'",
    @click="emit('cmdk')"
  )
    q-icon(name='search', :style="{ color: 'var(--p-ink-3)' }")
    span(:style="{ color: 'var(--p-ink-2)', flex: 1, textAlign: 'left' }") {{ cmdkLabel ?? 'Найти' }}
    span(:style="{ display: 'inline-flex', gap: '2px' }")
      span.kbd ⌘
      span.kbd K

  //- Пункты — секции с заголовками ИЛИ плоский список (всегда в .rail__nav)
  template(v-if='hasSections')
    template(v-for='(entry, idx) in items', :key='idx')
      template(v-if='isSection(entry)')
        .rail__sect-label {{ entry.section }}
        nav.rail__nav
          component(
            v-for='item in entry.items',
            :key='item.key',
            :is="item.route ? 'router-link' : 'div'",
            :to='item.route',
            active-class='',
            exact-active-class='',
            :class="['rail__item', { 'rail__item--active': item.key === activeKey }]",
            :role="item.route ? undefined : 'button'",
            :tabindex='item.route ? undefined : 0',
            @click="emit('select', item)",
            @keydown.enter="emit('select', item)",
            @keydown.space.prevent="emit('select', item)"
          )
            q-icon.rail__item-ico(v-if='item.icon', :name='item.icon')
            span.rail__item-label {{ item.label }}
            span.rail__item-meta(v-if='item.badge !== undefined') {{ item.badge }}
            span.rail__item-meta(v-else-if='item.meta') {{ item.meta }}
      nav.rail__nav(v-else)
        component(
          :is="(entry as RailItem).route ? 'router-link' : 'div'",
          :to='(entry as RailItem).route',
          active-class='',
          exact-active-class='',
          :class="['rail__item', { 'rail__item--active': (entry as RailItem).key === activeKey }]",
          :role="(entry as RailItem).route ? undefined : 'button'",
          :tabindex='(entry as RailItem).route ? undefined : 0',
          @click="emit('select', entry as RailItem)",
          @keydown.enter="emit('select', entry as RailItem)",
          @keydown.space.prevent="emit('select', entry as RailItem)"
        )
          q-icon.rail__item-ico(v-if='(entry as RailItem).icon', :name='(entry as RailItem).icon!')
          span.rail__item-label {{ (entry as RailItem).label }}
          span.rail__item-meta(v-if='(entry as RailItem).badge !== undefined') {{ (entry as RailItem).badge }}
          span.rail__item-meta(v-else-if='(entry as RailItem).meta') {{ (entry as RailItem).meta }}

  nav.rail__nav.rail__nav--flat(v-else)
    component(
      v-for='item in (items as RailItem[])',
      :key='item.key',
      :is="item.route ? 'router-link' : 'div'",
      :to='item.route',
      active-class='',
      exact-active-class='',
      :class="['rail__item', { 'rail__item--active': item.key === activeKey }]",
      :role="item.route ? undefined : 'button'",
      :tabindex='item.route ? undefined : 0',
      @click="emit('select', item)",
      @keydown.enter="emit('select', item)",
      @keydown.space.prevent="emit('select', item)"
    )
      q-icon.rail__item-ico(v-if='item.icon', :name='item.icon')
      span.rail__item-label {{ item.label }}
      span.rail__item-meta(v-if='item.badge !== undefined') {{ item.badge }}
      span.rail__item-meta(v-else-if='item.meta') {{ item.meta }}

  .rail__spacer

  slot(name='footer')
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { AppDrawerProps, RailItem, RailSection } from './AppDrawer.types';

const props = defineProps<AppDrawerProps>();

const emit = defineEmits<{
  select: [item: RailItem];
  cmdk: [];
}>();

function isSection(entry: RailItem | RailSection): entry is RailSection {
  return (entry as RailSection).section !== undefined;
}

const hasSections = computed<boolean>(() =>
  (props.items ?? []).some((e) => isSection(e)),
);

// Canon-inline-стиль для cmdk: выровнен по горизонтали с .rail__nav (padding 0 8px),
// margin-bottom = 8px чтобы был визуальный gap между ⌘K и первым пунктом меню
// (rail__nav сам добавит 4px padding-top, итого ~12px).
const cmdkStyle = {
  margin: '12px 8px 8px',
  alignSelf: 'stretch',
  width: 'auto',
  height: '32px',
  justifyContent: 'flex-start',
  padding: '0 12px',
  gap: '10px',
} as const;
</script>

<style scoped>
.kbd {
  display: inline-grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--p-surface);
  border: 1px solid var(--p-line-1);
  font: 500 10px/1 var(--p-mono);
  color: var(--p-ink-2);
}
</style>
