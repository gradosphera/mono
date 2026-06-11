<template>
  <div
    :class="['wallet', { 'wallet--row': compact, 'wallet--empty': empty }]"
    :style="progStyle"
    :tabindex="titleOverflow || subOverflow ? 0 : undefined"
  >
    <span class="wallet__icon">
      <q-icon :name="resolvedIcon" />
    </span>

    <div class="wallet__main">
      <div
        ref="titleEl"
        class="wallet__title"
        :class="{ 'is-marquee': titleOverflow }"
        :title="resolvedTitle"
      >
        <span class="wallet__scroll">{{ resolvedTitle }}</span>
      </div>
      <div
        v-if="subtitle"
        ref="subEl"
        class="wallet__sub"
        :class="{ 'is-marquee': subOverflow }"
        :title="subtitle"
      >
        <span class="wallet__scroll">{{ subtitle }}</span>
      </div>
    </div>

    <div class="wallet__amount">
      <div class="wallet__metric">
        <div class="wallet__metric-val">
          <template v-if="loading">—</template>
          <template v-else-if="empty">0,00<span class="ccy">{{ symbol }}</span></template>
          <template v-else>{{ balance }}<span class="ccy">{{ symbol }}</span></template>
        </div>
        <div class="wallet__metric-label">{{ balanceLabel ?? 'Доступно' }}</div>
      </div>

      <div v-if="lockedBalance !== undefined" class="wallet__locked-line">
        <q-icon name="lock" />
        {{ lockedLabel ?? 'Заблокировано' }}: <b>{{ lockedBalance }}</b>
        <span class="ccy">&nbsp;{{ symbol }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import type { WalletCardProps, WalletProgram } from './WalletCard.types';

const props = withDefaults(defineProps<WalletCardProps>(), {
  loading: false,
  compact: false,
  empty: false,
});

const DEFAULT_TITLES: Record<WalletProgram, string> = {
  blagorost: 'Благорост',
  wallet: 'Главный кошелёк',
  generator: 'Генератор',
};

const DEFAULT_ICONS: Record<WalletProgram, string> = {
  blagorost: 'savings',
  wallet: 'account_balance_wallet',
  generator: 'bolt',
};

const resolvedTitle = computed(
  () => props.title ?? (props.program ? DEFAULT_TITLES[props.program] : ''),
);
const resolvedIcon = computed(
  () => props.icon ?? (props.program ? DEFAULT_ICONS[props.program] : 'savings'),
);

const progStyle = computed<CSSProperties>(() => {
  // Нейтральная карточка (или без программы) — приглушённая иконка без акцента.
  if (props.neutral || !props.program) {
    return {
      '--prog-bg': 'var(--p-canvas-2)',
      '--prog-fg': 'var(--p-ink-2)',
    } as CSSProperties;
  }
  return {
    '--prog-bg': `var(--prog-${props.program}-soft)`,
    '--prog-fg': `var(--prog-${props.program})`,
  } as CSSProperties;
});

// Бегущая строка при переполнении. Если заголовок/подпись не влезают в свою
// колонку — вместо обрезки «…» текст плавно прокручивается туда-обратно, чтобы
// на узком экране можно было прочитать целиком. Заголовок и подпись бегут
// одинаково (одна длительность анимации, синхронные паузы на краях).
const titleEl = ref<HTMLElement | null>(null);
const subEl = ref<HTMLElement | null>(null);
const titleOverflow = ref(false);
const subOverflow = ref(false);

function measureEl(el: HTMLElement | null, flag: typeof titleOverflow): void {
  if (!el) return;
  // scrollWidth — полная ширина текста, clientWidth — видимая колонка.
  const overflow = el.scrollWidth - el.clientWidth;
  if (overflow > 1) {
    el.style.setProperty('--marquee-shift', `-${overflow}px`);
    flag.value = true;
  } else {
    el.style.removeProperty('--marquee-shift');
    flag.value = false;
  }
}

function measure(): void {
  measureEl(titleEl.value, titleOverflow);
  measureEl(subEl.value, subOverflow);
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  void nextTick(measure);
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => measure());
    if (titleEl.value) ro.observe(titleEl.value);
    if (subEl.value) ro.observe(subEl.value);
  }
});

onBeforeUnmount(() => {
  ro?.disconnect();
  ro = null;
});

// Текст/подпись могут смениться (смена кошелька в списке) — перемерить.
watch([resolvedTitle, () => props.subtitle], () => void nextTick(measure));
</script>

<style scoped>
/* Inner-span нужен, чтобы анимировать прокрутку текста внутри колонки с
   overflow:hidden (canon .wallet__title/.wallet__sub). По умолчанию текст
   просто обрезается; при is-marquee — бежит. */
.wallet__scroll {
  display: inline-block;
  white-space: nowrap;
  will-change: transform;
}
/* В покое — обычная обрезка с «…», без постоянного бега (иначе дёргается).
   Прокрутка целиком включается только при наведении/фокусе карточки и сразу
   для обеих строк (заголовок + подпись). На тач карточка фокусируется тапом
   (tabindex навешивается только при реальном переполнении). */
.wallet:hover .wallet__title.is-marquee,
.wallet:hover .wallet__sub.is-marquee,
.wallet:focus-within .wallet__title.is-marquee,
.wallet:focus-within .wallet__sub.is-marquee {
  text-overflow: clip;
}
.wallet:hover .wallet__title.is-marquee .wallet__scroll,
.wallet:hover .wallet__sub.is-marquee .wallet__scroll,
.wallet:focus-within .wallet__title.is-marquee .wallet__scroll,
.wallet:focus-within .wallet__sub.is-marquee .wallet__scroll {
  animation: wallet-marquee 6s ease-in-out infinite alternate;
}
.wallet:focus-visible {
  outline: 2px solid var(--p-primary);
  outline-offset: 2px;
}
@keyframes wallet-marquee {
  0%,
  18% {
    transform: translateX(0);
  }
  82%,
  100% {
    transform: translateX(var(--marquee-shift, 0));
  }
}
@media (prefers-reduced-motion: reduce) {
  .wallet__scroll {
    animation: none !important;
  }
}
</style>
