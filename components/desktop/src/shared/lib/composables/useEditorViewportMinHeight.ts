import {
  type Ref,
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from 'vue';

function resolveHTMLElement(
  node: HTMLElement | { $el?: unknown } | null | undefined,
): HTMLElement | null {
  if (!node) return null;
  if (node instanceof HTMLElement) return node;
  const el = (node as { $el?: unknown }).$el;
  return el instanceof HTMLElement ? el : null;
}

export interface UseEditorViewportMinHeightOptions {
  /** Минимальная высота редактора (px) */
  min?: number;
  /** Зазор от низа visual viewport (px) */
  bottomGap?: number;
  /**
   * Элемент или Quasar-компонент ($el), за размером которого следим.
   * Если не задан — берётся parentElement у якоря.
   */
  observeRef?: Ref<unknown>;
}

/**
 * min-height редактора: от верхней границы нулевого якоря сразу над редактором
 * до нижней кромки окна (visualViewport), с нижним зазором.
 */
export function useEditorViewportMinHeight(
  editorTopSentinelRef: Ref<HTMLElement | null | undefined>,
  options: UseEditorViewportMinHeightOptions = {},
): Ref<number> {
  const minPx = options.min ?? 280;
  const bottomGap = options.bottomGap ?? 24;
  const minHeight = ref(minPx);

  let resizeObserver: ResizeObserver | null = null;

  const recalc = () => {
    if (typeof window === 'undefined') return;
    const el = editorTopSentinelRef.value;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    if (el) {
      const top = el.getBoundingClientRect().top;
      const next = Math.floor(vh - top - bottomGap);
      minHeight.value = Math.max(minPx, next);
    } else {
      minHeight.value = minPx;
    }
  };

  const disconnectObserver = () => {
    resizeObserver?.disconnect();
    resizeObserver = null;
  };

  const resolveObserveTarget = (): HTMLElement | null => {
    const fromOpt = options.observeRef?.value;
    const resolved = resolveHTMLElement(fromOpt ?? null);
    if (resolved) return resolved;
    return editorTopSentinelRef.value?.parentElement ?? null;
  };

  const connectObserver = () => {
    disconnectObserver();
    const target = resolveObserveTarget();
    if (!target || typeof ResizeObserver === 'undefined') return;
    resizeObserver = new ResizeObserver(() => recalc());
    resizeObserver.observe(target);
  };

  const scheduleLayout = () => {
    void nextTick(() => {
      recalc();
      connectObserver();
    });
  };

  onMounted(() => {
    window.addEventListener('resize', recalc);
    window.visualViewport?.addEventListener('resize', recalc);
    window.visualViewport?.addEventListener('scroll', recalc);
    scheduleLayout();
  });

  watch(editorTopSentinelRef, scheduleLayout, { flush: 'post' });
  if (options.observeRef) {
    watch(options.observeRef, scheduleLayout, { flush: 'post' });
  }

  onBeforeUnmount(() => {
    window.removeEventListener('resize', recalc);
    window.visualViewport?.removeEventListener('resize', recalc);
    window.visualViewport?.removeEventListener('scroll', recalc);
    disconnectObserver();
  });

  return minHeight;
}
