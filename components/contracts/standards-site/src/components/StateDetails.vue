<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Standard, Transition, Ledger2Operation } from '@/types/standard';

const props = defineProps<{
  standard: Standard;
  focusStatus: string | null;
  focusEdge: string | null;
}>();

const router = useRouter();

const INITIAL_MARKER = '∅';
const START_ID = '__start__';

function actionShort(name: string): string {
  return name.split('::').pop() ?? name;
}

// Ищем human-имя действия в manifest.actions
function actionHumanFor(name: string): string | undefined {
  return props.standard.actions.find((a) => a.name === name)?.human;
}

function roleHuman(role: string): string {
  const map: Record<string, string> = {
    contributor: 'Участник',
    chairman: 'Председатель',
    soviet: 'Совет',
    soviet_members: 'Члены совета',
    meet: 'Общее собрание',
    gateway_operator: 'Оператор платежей',
    administrator: 'Администратор',
    chairman_or_soviet: 'Председатель / Совет',
  };
  return map[role] ?? role;
}

const focus = computed(() => props.focusStatus);

// Описание статуса (или метка «Старт», если фокус — стартовая точка)
const stateInfo = computed(() => {
  if (!focus.value || focus.value === '__start__') {
    return { label: 'Старт', description: 'Процесс ещё не начат — нет исходной записи сущности.' };
  }
  const s = props.standard.states.find((x) => x.name === focus.value);
  return s
    ? { label: s.name, description: s.description, kind: s.kind ?? (s.virtual ? 'virtual' : 'normal') }
    : { label: focus.value, description: 'Статус не описан в манифесте.' };
});

const virtualStates = computed(() =>
  new Set(props.standard.states.filter((s) => s.virtual || s.kind === 'virtual').map((s) => s.name)),
);

const incoming = computed<Transition[]>(() => {
  if (!focus.value || focus.value === '__start__') return [];
  return props.standard.transitions.filter((t) => t.to === focus.value);
});

const outgoing = computed<Transition[]>(() => {
  const f = focus.value ?? '__start__';
  const src = f === '__start__' ? INITIAL_MARKER : f;
  return props.standard.transitions.filter((t) => t.from === src);
});

// Поиск действия по имени (для описания)
function getActionPurpose(actionName: string): string | undefined {
  return props.standard.actions.find((a) => a.name === actionName)?.purpose;
}

// Поиск операций ledger2, привязанных к action (через triggered_by + явный transitions[].operations)
function getOperationsForTransition(t: Transition): Ledger2Operation[] {
  const byExplicit = t.operations ?? [];
  const byImplicit = props.standard.operations
    .filter((op) => op.triggered_by === t.action)
    .map((op) => op.ledger_code);
  const codes = new Set([...byExplicit, ...byImplicit]);
  return props.standard.operations.filter((op) => codes.has(op.ledger_code));
}

function goToState(name: string): void {
  if (virtualStates.value.has(name)) return;
  router.push({ query: { s: name } });
}

function goToEdge(edgeId: string): void {
  router.push({ query: { e: edgeId } });
}

// Поиск transition, соответствующего фокусному edgeId.
// edge.id имеет вид `${source}->${target}::${actionShort}`.
const focusedTransition = computed<{ t: Transition; edgeId: string } | null>(() => {
  if (!props.focusEdge) return null;
  for (const t of props.standard.transitions) {
    const source = t.from === INITIAL_MARKER ? START_ID : t.from;
    const short = t.action.split('::').pop() ?? t.action;
    const id = `${source}->${t.to}::${short}`;
    if (id === props.focusEdge) return { t, edgeId: id };
  }
  return null;
});

const focusedAction = computed(() => {
  const tr = focusedTransition.value;
  if (!tr) return null;
  return props.standard.actions.find((a) => a.name === tr.t.action) ?? null;
});

function accountLabel(
  acc: Ledger2Operation['debit'] | Ledger2Operation['credit'] | null,
): string {
  if (!acc) return '—';
  return `${acc.account} ${acc.name}`;
}

function walletLabel(w: Ledger2Operation['wallet_from'] | Ledger2Operation['wallet_to']): string {
  if (!w) return '—';
  return `${w.name} (${w.id})`;
}
</script>

<template>
  <section v-if="focusedTransition" class="details details--edge">
    <header class="details__head">
      <div class="details__kicker details__kicker--edge">Фокусное действие</div>
      <h3 class="details__title">
        <span v-if="focusedAction?.human" class="details__human">{{ focusedAction.human }}</span>
        <code class="details__title-code">{{ focusedTransition.t.action }}</code>
      </h3>
      <p class="details__desc">{{ focusedAction?.purpose ?? 'Действие контракта.' }}</p>
      <div class="details__meta">
        <span class="details__meta-item">
          <span class="details__label-mini">От</span>
          <button
            class="transitions__peer"
            :disabled="focusedTransition.t.from === INITIAL_MARKER"
            @click="goToState(focusedTransition.t.from === INITIAL_MARKER ? START_ID : focusedTransition.t.from)"
          >
            <code>{{ focusedTransition.t.from === INITIAL_MARKER ? 'Старт' : focusedTransition.t.from }}</code>
          </button>
        </span>
        <span class="transitions__arrow">→</span>
        <span class="details__meta-item">
          <span class="details__label-mini">К</span>
          <button
            class="transitions__peer"
            :disabled="virtualStates.has(focusedTransition.t.to)"
            @click="goToState(focusedTransition.t.to)"
          >
            <code>{{ virtualStates.has(focusedTransition.t.to) ? 'Отклонено' : focusedTransition.t.to }}</code>
          </button>
        </span>
        <span class="details__meta-item details__meta-item--actor">
          <span class="details__label-mini">Вызывает</span>
          <strong>{{ roleHuman(focusedTransition.t.actor) }}</strong>
        </span>
      </div>
    </header>

    <div v-if="focusedTransition.t.guards && focusedTransition.t.guards.length" class="details__block">
      <h4>Условия выполнения</h4>
      <ul class="bullets">
        <li v-for="(g, i) in focusedTransition.t.guards" :key="i">{{ g }}</li>
      </ul>
    </div>

    <div v-if="getOperationsForTransition(focusedTransition.t).length" class="details__block">
      <h4>Операции ledger2</h4>
      <div
        v-for="op in getOperationsForTransition(focusedTransition.t)"
        :key="op.ledger_code"
        class="transitions__op"
      >
        <div class="op__head">
          <code>{{ op.ledger_code }}</code>
          <span class="op__kind">{{ op.wallet_op }}</span>
        </div>
        <div class="op__body">{{ op.human_name }}</div>
        <dl class="op__grid">
          <div><dt>Кошелёк</dt><dd>{{ walletLabel(op.wallet_from) }} → {{ walletLabel(op.wallet_to) }}</dd></div>
          <div><dt>Дт</dt><dd>{{ accountLabel(op.debit) }}</dd></div>
          <div><dt>Кт</dt><dd>{{ accountLabel(op.credit) }}</dd></div>
          <div><dt>Сумма</dt><dd><code>{{ op.amount_ref }}</code></dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section v-else class="details">
    <header class="details__head">
      <div class="details__kicker">Фокусный статус</div>
      <h3 class="details__title">
        <code>{{ stateInfo.label }}</code>
        <span v-if="stateInfo.kind === 'final'" class="details__badge">финал</span>
        <span v-else-if="stateInfo.kind === 'initial'" class="details__badge">старт</span>
      </h3>
      <p class="details__desc">{{ stateInfo.description }}</p>
    </header>

    <!-- Входы -->
    <div v-if="incoming.length" class="details__block">
      <h4>Как сюда попадают</h4>
      <ul class="transitions">
        <li v-for="t in incoming" :key="`in:${t.from}:${t.action}`">
          <button
            class="transitions__peer"
            :disabled="virtualStates.has(t.from) || t.from === INITIAL_MARKER"
            @click="goToState(t.from === INITIAL_MARKER ? '__start__' : t.from)"
          >
            <code>{{ t.from === INITIAL_MARKER ? 'Старт' : t.from }}</code>
          </button>
          <span class="transitions__arrow">→</span>
          <button
            type="button"
            class="transitions__action transitions__action--clickable"
            :title="`Открыть описание действия ${actionShort(t.action)}`"
            @click="goToEdge(`${t.from === INITIAL_MARKER ? '__start__' : t.from}->${focus}::${actionShort(t.action)}`)"
          >
            <span v-if="actionHumanFor(t.action)" class="transitions__action-human">
              {{ actionHumanFor(t.action) }}
            </span>
            <code class="transitions__action-id">{{ actionShort(t.action) }}</code>
            <span class="transitions__actor">{{ roleHuman(t.actor) }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Выходы -->
    <div v-if="outgoing.length" class="details__block">
      <h4>Что может произойти дальше</h4>
      <ol class="transitions transitions--out">
        <li v-for="t in outgoing" :key="`out:${t.to}:${t.action}`" :class="{ 'transitions__row--reject': virtualStates.has(t.to) }">
          <div class="transitions__row">
            <button
              type="button"
              class="transitions__action transitions__action--clickable"
              :title="`Открыть описание действия ${actionShort(t.action)}`"
              @click="goToEdge(`${focus === '__start__' ? '__start__' : focus}->${t.to}::${actionShort(t.action)}`)"
            >
              <span v-if="actionHumanFor(t.action)" class="transitions__action-human">
                {{ actionHumanFor(t.action) }}
              </span>
              <code class="transitions__action-id">{{ actionShort(t.action) }}</code>
              <span class="transitions__actor">{{ roleHuman(t.actor) }}</span>
            </button>
            <span class="transitions__arrow">→</span>
            <button
              class="transitions__peer"
              :disabled="virtualStates.has(t.to)"
              @click="goToState(t.to)"
            >
              <code>{{ virtualStates.has(t.to) ? 'Отклонено' : t.to }}</code>
            </button>
          </div>

          <div v-if="getActionPurpose(t.action)" class="transitions__purpose">
            {{ getActionPurpose(t.action) }}
          </div>

          <div v-if="t.guards && t.guards.length" class="transitions__guards">
            <span class="transitions__label">Условия:</span>
            <ul>
              <li v-for="(g, i) in t.guards" :key="i">{{ g }}</li>
            </ul>
          </div>

          <div v-for="op in getOperationsForTransition(t)" :key="op.ledger_code" class="transitions__op">
            <div class="op__head">
              <code>{{ op.ledger_code }}</code>
              <span class="op__kind">{{ op.wallet_op }}</span>
            </div>
            <div class="op__body">
              <span>{{ op.human_name }}</span>
            </div>
            <dl class="op__grid">
              <div><dt>Кошелёк</dt><dd>{{ walletLabel(op.wallet_from) }} → {{ walletLabel(op.wallet_to) }}</dd></div>
              <div><dt>Дт</dt><dd>{{ accountLabel(op.debit) }}</dd></div>
              <div><dt>Кт</dt><dd>{{ accountLabel(op.credit) }}</dd></div>
              <div><dt>Сумма</dt><dd><code>{{ op.amount_ref }}</code></dd></div>
            </dl>
          </div>
        </li>
      </ol>
    </div>

    <div v-if="!incoming.length && !outgoing.length" class="details__empty">
      У этого статуса нет входов и выходов в манифесте.
    </div>
  </section>
</template>

<style scoped>
.details {
  margin-top: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg);
  padding: 20px 24px;
}
.details--edge {
  border-color: var(--edge-focus-border);
  background: var(--edge-focus-soft);
}
.details__kicker--edge {
  color: var(--edge-focus);
}
.details__title-code {
  font-family: var(--font-mono);
  font-size: 12px !important;
  background: var(--bg) !important;
  border-color: var(--edge-focus-border) !important;
  color: var(--edge-focus) !important;
}
.details__human {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}
.details__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}
.details__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.details__meta-item--actor {
  margin-left: auto;
  font-size: 13px;
  color: var(--text);
}
.details__meta-item strong {
  color: var(--text);
  font-weight: 600;
}
.details__label-mini {
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
}

.bullets {
  margin: 4px 0 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--text);
  line-height: 1.55;
}
.details__kicker {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-subtle);
}
.details__title {
  margin: 4px 0 6px;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}
.details__title code {
  font-family: var(--font-mono);
  font-size: 17px;
  background: var(--surface);
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
}
.details__badge {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--accent-border);
  border-radius: 10px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
}
.details__desc {
  color: var(--text-muted);
  margin: 0;
}

.details__block {
  margin-top: 20px;
}
.details__block h4 {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-subtle);
  margin: 0 0 10px;
}
.details__empty {
  margin-top: 16px;
  color: var(--text-muted);
  font-style: italic;
}

.transitions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.transitions--out { gap: 18px; }
.transitions__row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.transitions__row--reject { opacity: 0.75; }
.transitions__arrow {
  color: var(--text-subtle);
}
.transitions__peer {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text);
  transition: background 80ms ease, border-color 80ms ease;
}
.transitions__peer:not(:disabled):hover {
  background: var(--accent-soft);
  border-color: var(--accent-border);
}
.transitions__peer:disabled {
  cursor: default;
  color: var(--text-muted);
}
.transitions__action {
  display: inline-flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
  background: transparent;
  border: 1px solid transparent;
  padding: 3px 8px;
  border-radius: 6px;
  font: inherit;
  color: inherit;
  text-align: left;
}
.transitions__action--clickable {
  cursor: pointer;
  transition: background 80ms ease, border-color 80ms ease;
}
.transitions__action--clickable:hover {
  background: var(--edge-focus-soft);
  border-color: var(--edge-focus-border);
}
.transitions__action-human {
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}
.transitions__action-id {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 1px 6px;
  border-radius: 4px;
}
.transitions__actor {
  font-size: 12px;
  color: var(--text-muted);
}
.transitions__purpose {
  font-size: 13px;
  color: var(--text-muted);
  margin: 6px 0 0 2px;
}
.transitions__guards {
  margin-top: 6px;
  padding: 8px 12px;
  border-left: 2px solid var(--border-strong);
  background: var(--surface);
  border-radius: 0 6px 6px 0;
}
.transitions__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.transitions__guards ul {
  margin: 4px 0 0;
  padding-left: 16px;
  font-size: 13px;
  color: var(--text);
}

.transitions__op {
  margin-top: 10px;
  padding: 10px 12px;
  border: 1px solid var(--accent-border);
  background: var(--accent-soft);
  border-radius: 6px;
}
.op__head {
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.op__head code {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
  background: transparent;
  border: none;
  padding: 0;
}
.op__kind {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  padding: 1px 6px;
  border: 1px solid var(--accent-border);
  border-radius: 4px;
  color: var(--accent);
}
.op__body {
  font-size: 13px;
  color: var(--text);
  margin-top: 2px;
}
.op__grid {
  margin: 8px 0 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 24px;
}
.op__grid > div {
  display: flex;
  gap: 8px;
  font-size: 12px;
  min-width: 0;
}
.op__grid dt {
  color: var(--text-muted);
  min-width: 60px;
}
.op__grid dd {
  margin: 0;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
