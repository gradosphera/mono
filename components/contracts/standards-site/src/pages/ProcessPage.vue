<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { getStandard, standardsIndex } from '@/data/loader';
import { START_ID } from '@/graph/layout';
import ProcessGraph from '@/components/ProcessGraph.vue';

const route = useRoute();

const processType = computed(() =>
  typeof route.params.processType === 'string' ? route.params.processType : '',
);

const standard = computed(() => getStandard(processType.value));

const RELATION_HUMAN: Record<string, string> = {
  provides: 'обеспечивает',
  repaid_by: 'гасится в',
  affects: 'влияет на',
  consumes: 'потребляет',
  triggers: 'запускает',
};
function relationHuman(r: string): string {
  return RELATION_HUMAN[r] ?? r;
}

/**
 * Для каждой записи `related[]` смотрим, есть ли такой process_type у нас
 * в индексе — если да, делаем кликабельный RouterLink, иначе просто метку.
 */
interface RelatedView {
  label: string;
  relation: string;
  note: string;
  target: { contract: string; processType: string } | null;
}

const relatedLinks = computed<RelatedView[]>(() => {
  const list = standard.value?.related ?? [];
  return list.map((r) => {
    const pt = r.process_type;
    const known = pt ? standardsIndex.byProcessType[pt] : undefined;
    return {
      label: pt ?? r.id ?? '—',
      relation: r.relation,
      note: r.note,
      target: known ? { contract: known.contract, processType: known.process_type } : null,
    };
  });
});

/**
 * Единовременный фокус может быть только один:
 *   ?a=<action_name>   — действие
 *   ?d=<template>      — документ
 *   ?o=<ledger_code>   — операция ledger2
 *   ?s=<state>         — статус
 * Если ничего не задано — фокус на первом статусе процесса.
 */
const focusAction = computed<string | null>(() => {
  const q = route.query.a;
  return typeof q === 'string' && q.length > 0 ? q : null;
});
const focusDocument = computed<string | null>(() => {
  const q = route.query.d;
  return typeof q === 'string' && q.length > 0 ? q : null;
});
const focusOperation = computed<string | null>(() => {
  const q = route.query.o;
  return typeof q === 'string' && q.length > 0 ? q : null;
});

const focusStatus = computed<string | null>(() => {
  if (focusAction.value || focusDocument.value || focusOperation.value) return null;
  const q = route.query.s;
  if (typeof q === 'string' && q.length > 0) return q;
  if (!standard.value) return null;
  // По умолчанию фокусируемся на старте процесса (круглешок ∅) —
  // это «описание процесса», с которого начинаем чтение.
  const hasStart = standard.value.transitions.some((t) => t.from === '∅');
  if (hasStart) return START_ID;
  const first = standard.value.states.find((s) => !s.virtual && s.kind !== 'virtual');
  return first?.name ?? null;
});
</script>

<template>
  <div v-if="!standard" class="process-missing">
    <h1>Стандарт не найден</h1>
    <p>process_type: <code>{{ processType }}</code></p>
  </div>

  <div v-else class="process-page">
    <header class="process-head">
      <div class="process-head__top">
        <div class="process-head__title-box">
          <span class="process-head__kicker">{{ standard.contract }}</span>
          <h1>{{ standard.title }}</h1>
          <code class="process-head__code">{{ standard.process_type }}</code>
        </div>
        <div class="process-head__meta">
          <span v-if="standard.area">зона <code>{{ standard.area }}</code></span>
          <span>статус: <strong>{{ standard.status }}</strong></span>
        </div>
      </div>
      <p class="process-head__summary">{{ standard.summary }}</p>
    </header>

    <ProcessGraph
      :standard="standard"
      :focus-status="focusStatus"
      :focus-action="focusAction"
      :focus-document="focusDocument"
      :focus-operation="focusOperation"
    />

    <section v-if="relatedLinks.length" class="related">
      <h3>Связанные стандарты</h3>
      <ul class="related__list">
        <li v-for="(r, i) in relatedLinks" :key="i" class="related__item">
          <span class="related__relation">{{ relationHuman(r.relation) }}</span>
          <RouterLink
            v-if="r.target"
            class="related__peer related__peer--link"
            :to="{ name: 'process', params: { contract: r.target.contract, processType: r.target.processType } }"
          >
            <code>{{ r.label }}</code>
          </RouterLink>
          <span v-else class="related__peer related__peer--plain"><code>{{ r.label }}</code></span>
          <p class="related__note">{{ r.note }}</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.process-head {
  margin-bottom: 12px;
}
.process-head__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.process-head__title-box {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.process-head__title-box h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
}
.process-head__kicker {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-subtle);
  font-weight: 600;
}
.process-head__code {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 2px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
}
.process-head__summary {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  max-width: 780px;
  margin: 6px 0 0;
}
.process-head__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 11px;
  color: var(--text-muted);
}
.process-head__meta code {
  font-family: var(--font-mono);
}
.related {
  margin-top: 28px;
  max-width: 780px;
}
.related h3 {
  margin: 0 0 10px;
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-subtle);
  font-weight: 600;
  padding-bottom: 0;
  border-bottom: none;
}
.related__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.related__item {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: baseline;
}
.related__relation {
  font-size: 12px;
  color: var(--text-subtle);
  letter-spacing: 0.04em;
}
.related__peer {
  display: inline-flex;
  align-items: center;
}
.related__peer code {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.related__peer--link code {
  background: var(--accent-soft);
  border-color: var(--accent-border);
  color: var(--accent);
  transition: filter 80ms ease;
}
.related__peer--link:hover code {
  filter: brightness(1.05);
}
.related__peer--plain code {
  color: var(--text-muted);
  font-style: italic;
}
.related__note {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.55;
  flex-basis: 100%;
}
</style>
