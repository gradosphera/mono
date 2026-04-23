<script setup lang="ts">
/**
 * Горизонтальная полоса деталей фокуса.
 * Живёт внутри рабочей области ProcessGraph, приклеена к низу.
 * Показывает одно из: статус / действие / документ / операцию.
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Standard, Transition, Ledger2Operation, ContractAction, ProcessDocument } from '@/types/standard';

const props = defineProps<{
  standard: Standard;
  focusStatus: string | null;
  focusAction: string | null;
  focusDocument: string | null;
  focusOperation: string | null;
}>();

const router = useRouter();
const INITIAL_MARKER = '∅';
const START_ID = '__start__';
const END_ID = '__end__';

const ROLE_HUMAN: Record<string, string> = {
  contributor: 'Участник',
  chairman: 'Председатель',
  soviet: 'Совет',
  soviet_members: 'Члены совета',
  meet: 'Общее собрание',
  gateway_operator: 'Оператор платежей',
  administrator: 'Администратор',
  chairman_or_soviet: 'Председатель / Совет',
};
function roleHuman(r: string): string {
  return ROLE_HUMAN[r] ?? r;
}

function actionShort(name: string): string {
  return name.split('::').pop() ?? name;
}

const virtualStates = computed(() =>
  new Set(
    props.standard.states.filter((s) => s.virtual || s.kind === 'virtual').map((s) => s.name),
  ),
);

// Поиск транзишена для focusAction (первый попавшийся с этим именем)
const focusedTransition = computed<Transition | null>(() => {
  if (!props.focusAction) return null;
  return props.standard.transitions.find((t) => t.action === props.focusAction) ?? null;
});

const focusedAction = computed<ContractAction | null>(() => {
  if (!props.focusAction) return null;
  return props.standard.actions.find((a) => a.name === props.focusAction) ?? null;
});

function getOperationsForAction(actionName: string): Ledger2Operation[] {
  return props.standard.operations.filter((op) => op.triggered_by === actionName);
}

const opsForFocusedAction = computed<Ledger2Operation[]>(() => {
  if (!props.focusAction) return [];
  return getOperationsForAction(props.focusAction);
});

// Документ по шаблону
const focusedDocument = computed<ProcessDocument | null>(() => {
  if (!props.focusDocument) return null;
  return props.standard.documents.find((d) => d.template === props.focusDocument) ?? null;
});

// Операция по ledger_code
const focusedOperation = computed<Ledger2Operation | null>(() => {
  if (!props.focusOperation) return null;
  return props.standard.operations.find((op) => op.ledger_code === props.focusOperation) ?? null;
});

// Статус
const focusedState = computed(() => {
  if (focusedTransition.value || focusedDocument.value || focusedOperation.value) return null;
  const id = props.focusStatus;
  if (!id) return null;
  if (id === START_ID || id === END_ID) return null;
  const s = props.standard.states.find((x) => x.name === id);
  if (!s) return null;
  return {
    name: s.name,
    label: s.name,
    human: s.human ?? '',
    description: s.description,
    kind: s.kind ?? (s.virtual ? 'virtual' : 'normal'),
  };
});

const focusMode = computed<
  'action' | 'document' | 'operation' | 'state' | 'process-start' | 'process-end' | 'none'
>(() => {
  if (focusedTransition.value) return 'action';
  if (focusedDocument.value) return 'document';
  if (focusedOperation.value) return 'operation';
  if (props.focusStatus === START_ID) return 'process-start';
  if (props.focusStatus === END_ID) return 'process-end';
  if (focusedState.value) return 'state';
  return 'none';
});

const relatedCount = computed(() => (props.standard.related ?? []).length);

// ── Данные для «конца процесса» ─────────────────────────────────────────
const terminalStates = computed(() => {
  const vset = virtualStates.value;
  return props.standard.states.filter((s) => {
    if (s.virtual || s.kind === 'virtual') return false;
    if (s.kind === 'final') return true;
    const outs = props.standard.transitions.filter(
      (t) => t.from === s.name && !vset.has(t.to),
    );
    return outs.length === 0;
  });
});

function goToState(name: string): void {
  if (virtualStates.value.has(name)) return;
  router.push({ query: { s: name } });
}

function accLabel(acc: Ledger2Operation['debit'] | Ledger2Operation['credit']): string {
  return acc ? `${acc.account} ${acc.name}` : '—';
}

function walletLabel(w: Ledger2Operation['wallet_to']): string {
  return w ? `${w.name} (${w.id})` : '—';
}
</script>

<template>
  <section
    v-if="focusMode !== 'none'"
    class="focus-bar"
    :class="{
      'focus-bar--edge': focusMode === 'action',
      'focus-bar--doc': focusMode === 'document',
      'focus-bar--op': focusMode === 'operation',
      'focus-bar--process':
        focusMode === 'process-start' || focusMode === 'process-end',
    }"
  >
    <!-- Начало процесса -->
    <template v-if="focusMode === 'process-start'">
      <div class="focus-bar__col focus-bar__col--main">
        <div class="focus-bar__kicker">Начало процесса</div>
        <p v-if="standard.purpose" class="focus-bar__desc focus-bar__desc--lead">
          {{ standard.purpose }}
        </p>
      </div>
    </template>

    <!-- Конец процесса -->
    <template v-else-if="focusMode === 'process-end'">
      <div class="focus-bar__col focus-bar__col--main">
        <div class="focus-bar__kicker">Конец процесса</div>
        <div v-for="(s, i) in terminalStates" :key="i" class="focus-bar__entry">
          <div class="focus-bar__title-row">
            <code class="focus-bar__code focus-bar__code--state">{{ s.name }}</code>
            <span v-if="s.human" class="focus-bar__human">{{ s.human }}</span>
            <span class="focus-bar__badge">финал</span>
          </div>
          <p class="focus-bar__desc">{{ s.description }}</p>
        </div>
        <p v-if="relatedCount > 0" class="focus-bar__desc focus-bar__desc--hint">
          Связанные стандарты см. ниже ({{ relatedCount }}).
        </p>
      </div>
    </template>

    <!-- Действие -->
    <template v-if="focusMode === 'action' && focusedTransition">
      <div class="focus-bar__col focus-bar__col--main">
        <div class="focus-bar__kicker">Действие</div>
        <div class="focus-bar__title-row">
          <span class="focus-bar__human">{{ focusedAction?.human ?? actionShort(focusedTransition.action) }}</span>
          <code class="focus-bar__code">{{ focusedTransition.action }}</code>
          <span class="focus-bar__actor">· {{ roleHuman(focusedTransition.actor) }}</span>
        </div>
        <p v-if="focusedAction?.purpose" class="focus-bar__desc">{{ focusedAction.purpose }}</p>
      </div>

      <div class="focus-bar__col focus-bar__col--meta">
        <div class="focus-bar__peers">
          <button
            class="focus-bar__peer"
            :disabled="focusedTransition.from === INITIAL_MARKER"
            @click="goToState(focusedTransition.from === INITIAL_MARKER ? START_ID : focusedTransition.from)"
          >
            <code>{{ focusedTransition.from === INITIAL_MARKER ? 'Старт' : focusedTransition.from }}</code>
          </button>
          <span class="focus-bar__arrow">→</span>
          <button
            class="focus-bar__peer"
            :disabled="virtualStates.has(focusedTransition.to)"
            @click="goToState(focusedTransition.to)"
          >
            <code>{{ virtualStates.has(focusedTransition.to) ? 'Отклонено' : focusedTransition.to }}</code>
          </button>
        </div>
        <div v-if="focusedTransition.guards && focusedTransition.guards.length" class="focus-bar__guards">
          <span class="focus-bar__kicker-mini">Условия:</span>
          <span class="focus-bar__guard-list">
            <span v-for="(g, i) in focusedTransition.guards" :key="i" class="focus-bar__guard">{{ g }}</span>
          </span>
        </div>
      </div>

      <div v-if="opsForFocusedAction.length" class="focus-bar__col focus-bar__col--ops">
        <div class="focus-bar__kicker-mini">Операции ledger2</div>
        <div class="focus-bar__ops">
          <span v-for="op in opsForFocusedAction" :key="op.ledger_code" class="focus-bar__op" :title="op.human_name">
            <code>{{ op.ledger_code }}</code>
            <span class="focus-bar__op-dr">Дт {{ op.debit ? op.debit.account : '—' }}</span>
            <span class="focus-bar__op-cr">Кт {{ op.credit ? op.credit.account : '—' }}</span>
          </span>
        </div>
      </div>
    </template>

    <!-- Документ -->
    <template v-else-if="focusMode === 'document' && focusedDocument">
      <div class="focus-bar__col focus-bar__col--main">
        <div class="focus-bar__kicker">Документ</div>
        <div class="focus-bar__title-row">
          <span class="focus-bar__human">{{ focusedDocument.title }}</span>
          <code class="focus-bar__code">{{ focusedDocument.template }}</code>
        </div>
        <p class="focus-bar__desc">
          Подписывает: <strong>{{ focusedDocument.signed_by.map(roleHuman).join(', ') }}</strong>.
          Хранится в <code class="focus-bar__inline-code">{{ focusedDocument.stored_in }}</code>.
          <span v-if="focusedDocument.note" class="focus-bar__note">{{ focusedDocument.note }}</span>
        </p>
      </div>
    </template>

    <!-- Операция -->
    <template v-else-if="focusMode === 'operation' && focusedOperation">
      <div class="focus-bar__col focus-bar__col--main">
        <div class="focus-bar__kicker">Операция ledger2</div>
        <div class="focus-bar__title-row">
          <span class="focus-bar__human">{{ focusedOperation.human_name }}</span>
          <code class="focus-bar__code">{{ focusedOperation.ledger_code }}</code>
          <span class="focus-bar__kind-chip">{{ focusedOperation.wallet_op }}</span>
        </div>
        <p v-if="focusedOperation.description" class="focus-bar__desc">{{ focusedOperation.description }}</p>
      </div>

      <div class="focus-bar__col focus-bar__col--meta">
        <dl class="focus-bar__opdata">
          <div><dt>Кошелёк</dt><dd>{{ walletLabel(focusedOperation.wallet_from) }} → {{ walletLabel(focusedOperation.wallet_to) }}</dd></div>
          <div><dt>Дт</dt><dd>{{ accLabel(focusedOperation.debit) }}</dd></div>
          <div><dt>Кт</dt><dd>{{ accLabel(focusedOperation.credit) }}</dd></div>
          <div><dt>Сумма</dt><dd><code>{{ focusedOperation.amount_ref }}</code></dd></div>
        </dl>
      </div>
    </template>

    <!-- Статус -->
    <template v-else-if="focusMode === 'state' && focusedState">
      <div class="focus-bar__col focus-bar__col--main">
        <div class="focus-bar__kicker">Статус</div>
        <div class="focus-bar__title-row">
          <code class="focus-bar__code focus-bar__code--state">{{ focusedState.label }}</code>
          <span v-if="focusedState.human" class="focus-bar__human">{{ focusedState.human }}</span>
          <span v-if="focusedState.kind === 'final'" class="focus-bar__badge">финал</span>
          <span v-else-if="focusedState.kind === 'initial'" class="focus-bar__badge">старт</span>
        </div>
        <p class="focus-bar__desc">{{ focusedState.description }}</p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.focus-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 18px 28px;
  align-items: flex-start;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg);
}
.focus-bar--edge    { background: var(--edge-focus-soft); border-color: var(--edge-focus-border); }
.focus-bar--doc     { background: var(--accent-soft);     border-color: var(--accent-border); }
.focus-bar--op      { background: var(--edge-focus-soft); border-color: var(--edge-focus-border); }
.focus-bar--process { background: var(--accent-soft);     border-color: var(--accent-border); }
.focus-bar--process .focus-bar__kicker { color: var(--accent); }
.focus-bar--process .focus-bar__code   { color: var(--accent); border-color: var(--accent-border); }
.focus-bar__desc--hint {
  color: var(--text-subtle);
  font-style: italic;
  font-size: 11.5px;
}
.focus-bar__desc--lead {
  color: var(--text);
  font-size: 13px;
  line-height: 1.55;
}
.focus-bar__entry {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.focus-bar__entry + .focus-bar__entry {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--border);
}

.focus-bar__col { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.focus-bar__col--main { flex: 1 1 360px; }
.focus-bar__col--meta { flex: 0 0 auto; }
.focus-bar__col--ops  { flex: 1 1 240px; min-width: 200px; }

.focus-bar__kicker,
.focus-bar__kicker-mini {
  font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-subtle);
}
.focus-bar__kicker-mini { letter-spacing: 0.06em; }
.focus-bar--edge .focus-bar__kicker,
.focus-bar--op   .focus-bar__kicker { color: var(--edge-focus); }
.focus-bar--doc  .focus-bar__kicker { color: var(--accent); }

.focus-bar__title-row {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.focus-bar__human {
  font-size: 15px; font-weight: 600; color: var(--text);
}
.focus-bar__code {
  font-family: var(--font-mono); font-size: 11px;
  padding: 2px 6px; border-radius: 4px;
  background: var(--bg); border: 1px solid var(--border); color: var(--text-muted);
}
.focus-bar__code--state {
  font-size: 14px; padding: 2px 8px; color: var(--text); font-weight: 500;
}
.focus-bar--edge .focus-bar__code,
.focus-bar--op   .focus-bar__code { color: var(--edge-focus); border-color: var(--edge-focus-border); }
.focus-bar--doc  .focus-bar__code { color: var(--accent);     border-color: var(--accent-border); }

.focus-bar__actor { font-size: 12px; color: var(--text-muted); }
.focus-bar__kind-chip {
  font-family: var(--font-mono); font-size: 10px;
  padding: 1px 6px; border: 1px solid var(--edge-focus-border); border-radius: 3px;
  color: var(--edge-focus);
}
.focus-bar__badge {
  font-size: 10px; padding: 2px 8px;
  background: var(--accent-soft); color: var(--accent);
  border: 1px solid var(--accent-border); border-radius: 10px;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
}
.focus-bar__desc {
  margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--text-muted);
}
.focus-bar__inline-code {
  font-family: var(--font-mono); font-size: 11px;
  background: var(--bg); padding: 1px 4px; border-radius: 3px; border: 1px solid var(--border);
}
.focus-bar__note {
  display: inline-block; margin-left: 6px; color: var(--text-subtle); font-style: italic;
}

.focus-bar__peers { display: inline-flex; align-items: center; gap: 8px; margin-top: 2px; }
.focus-bar__peer {
  background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
  padding: 3px 8px; font-family: var(--font-mono); font-size: 12px;
  color: var(--text); cursor: pointer;
}
.focus-bar__peer:not(:disabled):hover {
  background: var(--accent-soft); border-color: var(--accent-border);
}
.focus-bar__peer:disabled { cursor: default; color: var(--text-muted); }
.focus-bar__arrow { color: var(--text-subtle); }

.focus-bar__guards { margin-top: 4px; display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--text); }
.focus-bar__guard-list { display: flex; flex-direction: column; gap: 2px; }
.focus-bar__guard::before { content: '· '; color: var(--text-subtle); }

.focus-bar__ops { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.focus-bar__op {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 3px 8px; background: var(--bg);
  border: 1px solid var(--edge-focus-border); border-radius: 4px;
  font-size: 11px; color: var(--text);
}
.focus-bar__op code {
  font-family: var(--font-mono); color: var(--edge-focus);
  font-weight: 600; background: transparent; border: none; padding: 0;
}
.focus-bar__op-dr, .focus-bar__op-cr {
  font-family: var(--font-mono); color: var(--text-muted); font-size: 10.5px;
}

.focus-bar__opdata {
  margin: 2px 0 0; display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px 18px;
}
.focus-bar__opdata > div { display: flex; gap: 8px; font-size: 11.5px; }
.focus-bar__opdata dt { color: var(--text-muted); min-width: 60px; }
.focus-bar__opdata dd {
  margin: 0; color: var(--text); font-family: var(--font-mono); font-size: 11.5px;
}
</style>
