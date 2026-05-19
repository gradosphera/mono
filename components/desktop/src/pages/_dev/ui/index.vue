<template>
  <main class="dev-ui">
    <header class="dev-ui__head">
      <div>
        <div class="t-eyebrow">MONO Platform v2</div>
        <h1 class="dev-ui__title">Базовые компоненты</h1>
        <p class="t-sm t-muted">
          Минимальный набор обёрток <code>src/shared/ui/base/*</code>, регистрируется
          глобально через <code>boot/ui.ts</code>. Используется как фундамент для
          компоновки страниц.
        </p>
      </div>
      <ThemeToggle />
    </header>

    <!-- ============ 01 BUTTONS ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">01</span>
        <h2 class="dev-ui__sect-title">Кнопки</h2>
        <p class="dev-ui__sect-sub">
          Один solid акцент, нейтральные secondary/ghost, скрытый destructive.
          Размеры sm · md · lg. Иконочная кнопка через <code>iconOnly</code>.
        </p>
      </div>
      <div class="dev-ui__stage">
        <div class="row row--wrap row--gap-4">
          <BaseButton variant="primary">Совершить взнос</BaseButton>
          <BaseButton variant="secondary">Получить возврат</BaseButton>
          <BaseButton variant="ghost">Отменить</BaseButton>
          <BaseButton variant="danger">Удалить</BaseButton>
        </div>
        <div class="row row--wrap row--gap-4" style="margin-top: 16px">
          <BaseButton variant="primary" size="lg">Большая основная</BaseButton>
          <BaseButton variant="secondary" size="sm">Малая вторичная</BaseButton>
          <BaseButton variant="ghost" size="sm">Малая ghost</BaseButton>
          <BaseButton variant="secondary" icon-only aria-label="Копировать">⎘</BaseButton>
          <BaseButton variant="primary" disabled>Disabled</BaseButton>
        </div>
        <div class="row row--wrap row--gap-4" style="margin-top: 16px; max-width: 320px">
          <BaseButton variant="primary" block>Растянутая (block)</BaseButton>
        </div>
      </div>
    </section>

    <!-- ============ 02 INPUTS ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">02</span>
        <h2 class="dev-ui__sect-title">Поля ввода</h2>
        <p class="dev-ui__sect-sub">
          Hairline-граница, focus — кольцо акцента. Префикс/суффикс через props,
          моноширинный режим — для логинов и идентификаторов.
        </p>
      </div>
      <div class="dev-ui__stage">
        <div class="grid-2">
          <BaseInput v-model="inputText" label="E-mail" placeholder="user@example.com" type="email" />
          <BaseInput v-model="inputMono" label="Имя аккаунта" mono />
          <BaseInput v-model="inputAmount" label="Сумма возврата" suffix="RUB" />
          <BaseInput v-model="inputError" label="Поле с ошибкой" error="Введите корректное значение" />
        </div>
      </div>
    </section>

    <!-- ============ 03 SELECT ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">03</span>
        <h2 class="dev-ui__sect-title">Выпадающий список</h2>
        <p class="dev-ui__sect-sub">
          Натив <code>&lt;select&gt;</code> с canon-оформлением. Для async-источников и
          мульти-выбора — отдельные компоненты в следующих эпиках.
        </p>
      </div>
      <div class="dev-ui__stage">
        <div class="grid-2">
          <BaseSelect
            v-model="selectMethod"
            label="Способ получения"
            placeholder="Выберите способ"
            :options="paymentOptions"
          />
          <BaseSelect
            v-model="selectPeriod"
            label="Период"
            :options="periodOptions"
            hint="Можно изменить позже в фильтре отчётов"
          />
        </div>
      </div>
    </section>

    <!-- ============ 04 CHIPS & BADGES ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">04</span>
        <h2 class="dev-ui__sect-title">Чипы и статусы</h2>
        <p class="dev-ui__sect-sub">
          Чип — заливка. Бэйдж со статус-точкой — для строк таблиц и информационных
          панелей. Один и тот же набор вариантов.
        </p>
      </div>
      <div class="grid-2">
        <div class="dev-ui__stage">
          <div class="t-eyebrow" style="margin-bottom: 14px">Чипы</div>
          <div class="row row--wrap row--gap-2">
            <BaseChip variant="pos">Завершён</BaseChip>
            <BaseChip variant="accent">Активный</BaseChip>
            <BaseChip variant="info">В обработке</BaseChip>
            <BaseChip variant="warn">Ожидает подписи</BaseChip>
            <BaseChip variant="neg">Отклонён</BaseChip>
            <BaseChip variant="neutral">Черновик</BaseChip>
          </div>
        </div>
        <div class="dev-ui__stage">
          <div class="t-eyebrow" style="margin-bottom: 14px">Точка + текст</div>
          <div class="stack stack--3">
            <BaseBadge variant="pos">Завершён · 10.03.2026</BaseBadge>
            <BaseBadge variant="accent">Активный</BaseBadge>
            <BaseBadge variant="info">В обработке советом</BaseBadge>
            <BaseBadge variant="warn">Ожидает 2 подписи</BaseBadge>
            <BaseBadge variant="neg">Отклонён · 02.04.2026</BaseBadge>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 05 CARDS ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">05</span>
        <h2 class="dev-ui__sect-title">Карточки</h2>
        <p class="dev-ui__sect-sub">
          Базовый контейнер: surface, hairline-граница, радиус 12. Шапка с заголовком
          и действиями — через слоты или props.
        </p>
      </div>
      <div class="grid-2">
        <BaseCard title="Удостоверение пайщика" subtitle="Регистрационные данные">
          <template #actions>
            <BaseButton variant="ghost" size="sm">Изменить</BaseButton>
          </template>
          <p class="t-sm t-muted">
            Базовая карточка с заголовком, сабтайтлом и кнопкой действия в шапке.
            Внутри — произвольное содержимое через дефолтный слот.
          </p>
        </BaseCard>

        <BaseCard variant="flat" title="Flat-вариант">
          <p class="t-sm t-muted">
            Без рамки, фон <code>surface-2</code>. Удобно для вложенных карточек
            и второго уровня иерархии.
          </p>
        </BaseCard>
      </div>
    </section>

    <!-- ============ 06 BANNERS ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">06</span>
        <h2 class="dev-ui__sect-title">Баннеры</h2>
        <p class="dev-ui__sect-sub">Тонкая полоса с иконкой и текстом. Внутри диалогов и в шапке экранов.</p>
      </div>
      <div class="dev-ui__stage">
        <div class="stack stack--3">
          <BaseBanner variant="info">
            <template #icon>i</template>
            Заявление будет отправлено в совет кооператива на рассмотрение.
          </BaseBanner>
          <BaseBanner variant="pos">
            <template #icon>✓</template>
            Паевой взнос на сумму 1&nbsp;000,00&nbsp;RUB успешно проведён в реестре.
          </BaseBanner>
          <BaseBanner variant="warn">
            <template #icon>!</template>
            Требуется подпись 2&nbsp;из&nbsp;5 членов совета.
          </BaseBanner>
          <BaseBanner variant="neg">
            <template #icon>×</template>
            Не удалось проверить подпись. Обновите ключ и повторите.
          </BaseBanner>
        </div>
      </div>
    </section>

    <!-- ============ 07 DIALOG ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">07</span>
        <h2 class="dev-ui__sect-title">Диалоги</h2>
        <p class="dev-ui__sect-sub">
          Модальное окно с шапкой, телом и подвалом действий. Telleport в body,
          закрытие по backdrop и Escape — управляемое через props.
        </p>
      </div>
      <div class="dev-ui__stage">
        <div class="row row--wrap row--gap-4">
          <BaseButton @click="dialogOpen = true">Открыть диалог</BaseButton>
        </div>

        <BaseDialog v-model="dialogOpen" title="Паевой взнос">
          <p class="t-sm t-muted" style="margin: 0">
            Укажите сумму взноса в ЦПП «Цифровой кошелёк». Документ будет
            сформирован и подписан автоматически.
          </p>
          <BaseInput v-model="dialogAmount" label="Сумма" suffix="RUB" />
          <template #footer>
            <BaseButton variant="ghost" @click="dialogOpen = false">Отменить</BaseButton>
            <BaseButton variant="primary" @click="dialogOpen = false">Продолжить</BaseButton>
          </template>
        </BaseDialog>
      </div>
    </section>

    <!-- ============ 08 FORM ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">08</span>
        <h2 class="dev-ui__sect-title">Форма</h2>
        <p class="dev-ui__sect-sub">
          Контейнер <code>BaseForm</code> с собственным submit, общей ошибкой
          через prop <code>error</code>, кнопками в слоте <code>#footer</code>.
        </p>
      </div>
      <div class="dev-ui__stage" style="max-width: 480px">
        <BaseForm :loading="formLoading" :error="formError" @submit="onFormSubmit">
          <BaseInput v-model="formEmail" label="E-mail" type="email" required placeholder="chairman@voskhod.ru" />
          <BaseInput v-model="formPass" label="Пароль" type="password" required />
          <template #footer="{ loading }">
            <BaseButton variant="ghost" type="button">Отмена</BaseButton>
            <BaseButton variant="primary" type="submit" :disabled="loading">
              {{ loading ? 'Отправка…' : 'Войти' }}
            </BaseButton>
          </template>
        </BaseForm>
      </div>
    </section>

    <!-- ============ 09 EMPTY STATE ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">09</span>
        <h2 class="dev-ui__sect-title">Пустые состояния</h2>
        <p class="dev-ui__sect-sub">Скромная иконка-плитка, заголовок, сабтайтл, действие.</p>
      </div>
      <div class="dev-ui__stage">
        <EmptyState
          title="Способы получения платежей не добавлены"
          body="Добавьте банковскую карту или реквизиты, чтобы кооператив мог перечислять вам средства."
        >
          <template #icon>$</template>
          <template #action>
            <BaseButton variant="primary">Добавить способ</BaseButton>
          </template>
        </EmptyState>
      </div>
    </section>

    <!-- ============ 10 AVATAR ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">10</span>
        <h2 class="dev-ui__sect-title">Аватары</h2>
        <p class="dev-ui__sect-sub">
          Размеры xs · sm · md · lg · xl. Если задан <code>src</code> — картинка;
          иначе инициалы из props <code>name</code>.
        </p>
      </div>
      <div class="dev-ui__stage">
        <div class="row row--gap-6" style="align-items: center">
          <Avatar name="Антон Председатель" size="xs" />
          <Avatar name="Антон Председатель" size="sm" />
          <Avatar name="Антон Председатель" />
          <Avatar name="Антон Председатель" size="lg" tone="accent" />
          <Avatar name="Антон Председатель" size="xl" tone="ink" />
        </div>
      </div>
    </section>

    <!-- ============ 11 TABLE ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">11</span>
        <h2 class="dev-ui__sect-title">Таблица</h2>
        <p class="dev-ui__sect-sub">
          Базовая таблица: header uppercase eyebrow, hairline-разделители,
          tabular-nums для числовых колонок.
        </p>
      </div>
      <BaseTable :columns="tableColumns" :rows="tableRows" row-key="id">
        <template #cell-status="{ value }">
          <BaseBadge :variant="(value as 'pos' | 'warn' | 'neg')">
            {{ statusLabel(value as string) }}
          </BaseBadge>
        </template>
        <template #cell-amount="{ value }">
          <span class="t-num">{{ value }} RUB</span>
        </template>
      </BaseTable>
    </section>

    <!-- ============ 12 AUTH CARD ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">12</span>
        <h2 class="dev-ui__sect-title">Карточка авторизации</h2>
        <p class="dev-ui__sect-sub">
          Контейнер для экранов входа/регистрации с teal-капом. Внутри — обычная форма.
        </p>
      </div>
      <div class="dev-ui__stage" style="display: grid; place-items: center; padding: 36px 24px">
        <AuthCard title="Вход в кооператив" subtitle="Восход — рабочее пространство председателя">
          <BaseForm @submit.prevent>
            <BaseInput v-model="authEmail" label="E-mail" type="email" placeholder="user@example.com" />
            <BaseInput v-model="authPass" label="Пароль" type="password" />
          </BaseForm>
          <BaseButton variant="primary" block>Войти</BaseButton>
          <template #footer>
            <a href="#" class="t-sm t-muted">Забыли ключ?</a>
            <a href="#" class="t-sm t-accent">Зарегистрироваться</a>
          </template>
        </AuthCard>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const inputText = ref('chairman.voskhod@gmail.com');
const inputMono = ref('ant');
const inputAmount = ref('1 000');
const inputError = ref('');

const paymentOptions = [
  { value: 'card', label: 'Банковская карта (СБП)' },
  { value: 'account', label: 'По реквизитам счёта' },
  { value: 'wallet', label: 'Списать с кошелька' },
];
const selectMethod = ref<string | number>('');

const periodOptions = [
  { value: 'last-7', label: 'Последние 7 дней' },
  { value: 'this-month', label: 'Текущий месяц' },
  { value: 'apr-2026', label: 'Апрель 2026' },
  { value: 'mar-2026', label: 'Март 2026' },
];
const selectPeriod = ref<string | number>('apr-2026');

const dialogOpen = ref(false);
const dialogAmount = ref('1 000');

const formEmail = ref('');
const formPass = ref('');
const formLoading = ref(false);
const formError = ref('');
function onFormSubmit(): void {
  formError.value = '';
  formLoading.value = true;
  setTimeout(() => {
    formLoading.value = false;
    formError.value = 'Неверный e-mail или пароль (демо-валидация).';
  }, 800);
}

const authEmail = ref('');
const authPass = ref('');

interface TableRow {
  id: string;
  doc: string;
  date: string;
  amount: string;
  status: 'pos' | 'warn' | 'neg';
}
const tableColumns = [
  { key: 'doc', label: 'Документ' },
  { key: 'date', label: 'Дата' },
  { key: 'amount', label: 'Сумма', numeric: true },
  { key: 'status', label: 'Статус' },
] as const;
const tableRows: TableRow[] = [
  { id: '1', doc: 'Заявление на возврат паевого взноса', date: '12.04.2026', amount: '1 200,00', status: 'pos' },
  { id: '2', doc: 'Решение совета №14', date: '08.04.2026', amount: '— — —', status: 'warn' },
  { id: '3', doc: 'Договор участия в ЦПП «Благорост»', date: '02.04.2026', amount: '750,00', status: 'neg' },
];
function statusLabel(s: string): string {
  return { pos: 'Завершён', warn: 'Ожидает подписи', neg: 'Отклонён' }[s] ?? s;
}
</script>

<style scoped>
.dev-ui {
  min-height: 100vh;
  background: var(--p-canvas);
  color: var(--p-ink-1);
  padding: 48px 32px 96px;
  max-width: 1100px;
  margin: 0 auto;
  font-family: var(--p-sans, 'Inter', system-ui);
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.dev-ui__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--p-line);
}
.dev-ui__title {
  font-size: var(--p-fs-display);
  line-height: var(--p-lh-display);
  letter-spacing: var(--p-ls-display);
  font-weight: 600;
  margin: 4px 0 8px;
}

.dev-ui__sect {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dev-ui__sect-head {
  display: grid;
  grid-template-columns: 36px 1fr;
  grid-template-rows: auto auto;
  column-gap: 12px;
  align-items: baseline;
}
.dev-ui__sect-num {
  grid-row: 1 / span 2;
  font-family: var(--p-mono);
  font-size: var(--p-fs-meta);
  color: var(--p-ink-3);
  letter-spacing: 0.08em;
  padding-top: 4px;
}
.dev-ui__sect-title {
  font-size: var(--p-fs-h2);
  line-height: var(--p-lh-h2);
  letter-spacing: var(--p-ls-h2);
  font-weight: 600;
  margin: 0;
}
.dev-ui__sect-sub {
  color: var(--p-ink-2);
  font-size: var(--p-fs-body-sm);
  margin: 0;
  max-width: 720px;
}

.dev-ui__stage {
  background: var(--p-surface);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-md);
  padding: 24px;
}

code {
  font-family: var(--p-mono);
  font-size: 0.92em;
  background: var(--p-surface-2);
  padding: 1px 6px;
  border-radius: var(--p-r-xs);
  color: var(--p-ink);
}
</style>
