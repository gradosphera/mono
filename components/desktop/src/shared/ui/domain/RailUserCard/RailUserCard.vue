<template>
  <div :class="['rail__usercard', { 'is-collapsed': collapsed }]">
    <div class="rail__usertop">
      <span class="rail__avatar">
        <img v-if="avatarSrc" :src="avatarSrc" :alt="name" />
        <template v-else>{{ initials }}</template>
      </span>
      <div class="rail__userinfo">
        <b>{{ name }}</b>
        <span v-if="role">{{ role }}</span>
      </div>
      <slot name="usertop-extra" />
    </div>

    <component
      :is="balanceTag"
      v-if="hasBalance"
      class="rail__balance"
      :class="{ 'rail__balance--clickable': isBalanceClickable }"
      :to="balanceRoute"
      @click="onBalanceClick"
    >
      <div class="rail__balance-label">{{ balanceLabel ?? 'Доступно' }}</div>
      <div class="rail__balance-val">
        <b>{{ balance }}</b>
        <span v-if="symbol" class="ccy">{{ symbol }}</span>
      </div>
      <div v-if="lockedBalance !== undefined" class="rail__balance-locked">
        <q-icon name="lock" />
        {{ lockedLabel ?? 'Заблокировано' }}: <b>{{ lockedBalance }}</b>
        <span v-if="symbol" class="ccy">&nbsp;{{ symbol }}</span>
      </div>
    </component>

    <div class="rail__actions">
      <slot name="actions">
        <button
          class="rail__action rail__action--primary"
          type="button"
          @click="emit('primary-action')"
        >
          <q-icon name="add" />
          {{ primaryActionLabel ?? 'Пополнить' }}
        </button>
      </slot>
      <button
        class="rail__usercard__collapse"
        type="button"
        :aria-label="collapsed ? 'Развернуть кошелёк' : 'Свернуть кошелёк'"
        :aria-expanded="!collapsed"
        @click="toggleCollapsed"
      >
        <q-icon name="expand_more" />
      </button>
    </div>
  </div>

  <button
    v-if="showSignout"
    class="rail__signout"
    type="button"
    @click="emit('signout')"
  >
    <q-icon name="logout" />
    {{ signoutLabel ?? 'Выйти' }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RailUserCardProps } from './RailUserCard.types';

const props = withDefaults(defineProps<RailUserCardProps>(), {
  collapsed: false,
  showSignout: false,
});

const emit = defineEmits<{
  'primary-action': [];
  'update:collapsed': [value: boolean];
  'balance-click': [event: MouseEvent];
  signout: [];
}>();

const initials = computed(() => {
  const parts = (props.name ?? '').trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
});

const hasBalance = computed(
  () => props.balance !== undefined && props.balance !== null && props.balance !== '',
);

const isBalanceClickable = computed(() => !!props.balanceRoute);
const balanceTag = computed(() => (props.balanceRoute ? 'router-link' : 'div'));

function toggleCollapsed(): void {
  emit('update:collapsed', !props.collapsed);
}
function onBalanceClick(event: MouseEvent): void {
  if (props.balanceRoute || event) emit('balance-click', event);
}
</script>

<style scoped>
/* === Chevron rotation ===
   canon CSS-правило `.rail__usercard__collapse svg { transform: rotate(180deg) }`
   рассчитано на `<svg>`. Quasar `<q-icon>` рендерит `<i class="q-icon">`,
   поэтому canon-селектор не срабатывает. Прокидываем поведение через :deep. */
.rail__usercard__collapse :deep(.q-icon) {
  transition: transform var(--p-dur-base, 200ms) var(--p-ease-standard, ease);
  font-size: 14px;
  color: inherit;
}
.rail__usercard.is-collapsed .rail__usercard__collapse :deep(.q-icon) {
  transform: rotate(180deg);
}

/* === Плавная свёртка ===
   canon использует `display: none`, что даёт резкий jump высоты карточки и
   визуальное «прыгание» chevron'а. Подменяем display:none на анимируемые
   `max-height`/`opacity`. Логика canon селекторов (`is-collapsed`) не
   нарушается — мы лишь добавляем плавность. */
.rail__usercard .rail__balance,
.rail__usercard .rail__action--primary {
  overflow: hidden;
  transition: max-height var(--p-dur-base, 200ms) var(--p-ease-standard, ease),
              opacity var(--p-dur-fast, 120ms) ease,
              padding var(--p-dur-base, 200ms) var(--p-ease-standard, ease);
  max-height: 200px;
  opacity: 1;
}
.rail__usercard.is-collapsed .rail__balance,
.rail__usercard.is-collapsed .rail__action--primary {
  display: flex !important; /* отменяем canon `display: none` */
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  border-top-width: 0;
  border-bottom-width: 0;
  pointer-events: none;
}
/* Primary в свёрнутом виде остаётся в DOM (для анимации), но flex: 0 +
   width: 0 — освобождает место для chevron, который canon делает
   width: 100% в `.is-collapsed`. Без этого слева остаётся «фантомный
   отступ» от схлопнутого primary. */
.rail__usercard.is-collapsed .rail__action--primary {
  flex: 0 0 0;
  width: 0;
  margin: 0;
  min-width: 0;
}

/* === Clickable balance ===
   Когда задан `balanceRoute`, оборачиваем содержимое в `<router-link>`
   и подсвечиваем кликабельность. */
.rail__balance--clickable {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: background var(--p-dur-fast, 120ms) ease;
}
.rail__balance--clickable:hover {
  background: var(--p-accent-soft);
  filter: brightness(0.97);
}

/* === Signout reset ===
   canon `.rail__signout` рассчитан на <div>; мы рендерим <button>, поэтому
   сбрасываем браузерные дефолты, не трогая canon-границу и padding. */
.rail__signout {
  font-family: inherit;
  width: 100%;
  text-align: left;
  background: transparent;
  /* border-top из canon оставляем как есть, обнуляя только остальные */
  border-right: 0;
  border-bottom: 0;
  border-left: 0;
}
</style>
