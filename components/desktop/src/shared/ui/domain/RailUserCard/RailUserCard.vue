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

    <div v-if="hasBalance" class="rail__balance">
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
    </div>

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
  signout: [];
}>();

const initials = computed(() => {
  const parts = (props.name ?? '').trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
});

const hasBalance = computed(() => props.balance !== undefined && props.balance !== null && props.balance !== '');

function toggleCollapsed(): void {
  emit('update:collapsed', !props.collapsed);
}
</script>

<style scoped>
/* canon `.rail__signout` рассчитан на <div>, мы рендерим <button> — сбрасываем
   браузерные дефолты, чтобы canon-правила полностью прокинулись. */
.rail__signout {
  font-family: inherit;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
}
</style>
