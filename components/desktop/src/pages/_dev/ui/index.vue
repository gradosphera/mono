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

    <!-- ============ 00 TOKEN PALETTE ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">00</span>
        <h2 class="dev-ui__sect-title">Палитра системы</h2>
        <p class="dev-ui__sect-sub">
          Текущие значения CSS-токенов <code>--p-*</code> для активной темы.
          Меняй цвет любого токена — компоненты ниже перекрасятся в реальном
          времени. Кнопка «Сбросить» возвращает дефолтные значения из
          <code>tokens.css</code>.
        </p>
      </div>
      <div class="dev-ui__stage">
        <div class="dev-ui__token-head">
          <span class="t-sm t-muted">
            Активная тема: <b>{{ themeName }}</b> · переопределено
            <b>{{ overriddenCount }}</b> токен(ов)
          </span>
          <BaseButton variant="ghost" size="sm" @click="resetTokens">
            Сбросить
          </BaseButton>
        </div>

        <template v-for="group in tokenGroups" :key="group.title">
          <div class="dev-ui__token-group-title">{{ group.title }}</div>
          <div class="dev-ui__tokens">
            <label
              v-for="t in group.items"
              :key="t.key"
              :class="['dev-ui__token', { 'dev-ui__token--overridden': overridden[t.key] }]"
            >
              <span class="dev-ui__token-swatch" :style="{ background: `var(${t.key})` }" />
              <div class="dev-ui__token-meta">
                <div class="dev-ui__token-name">{{ t.label }}</div>
                <code class="dev-ui__token-key">{{ t.key }}</code>
              </div>
              <input
                v-if="t.type === 'color'"
                type="color"
                class="dev-ui__token-picker"
                :value="hexValues[t.key] || '#000000'"
                @input="(e) => onColorChange(t.key, (e.target as HTMLInputElement).value)"
              />
              <input
                v-else
                type="text"
                class="dev-ui__token-text"
                :value="resolvedValues[t.key]"
                @change="(e) => onTextChange(t.key, (e.target as HTMLInputElement).value)"
              />
            </label>
          </div>
        </template>
      </div>
    </section>

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

    <!-- ============ 12 LAYOUT — APP DRAWER (rail) ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">12</span>
        <h2 class="dev-ui__sect-title">Боковая панель (AppDrawer)</h2>
        <p class="dev-ui__sect-sub">
          Solid surface (no gradient), активный пункт — soft-accent заливка
          пилюлей + 2-px рейл слева. Принимает <code>items</code> и
          <code>activeKey</code> через props.
        </p>
      </div>
      <div class="dev-ui__stage" style="padding: 0">
        <div class="dev-ui__rail-demo">
          <AppDrawer
            coop-name="ПК «Восход»"
            coop-meta="Стол пайщика"
            :items="railItems"
            :active-key="railActive"
            show-cmdk
            cmdk-label="Найти"
            @select="(i) => (railActive = i.key)"
          >
            <template #footer>
              <RailUserCard
                v-model:collapsed="railUserCollapsed"
                name="Муравьёв А.Н."
                role="Председатель совета"
                :balance="'400,00'"
                symbol="RUB"
                balance-route="/_dev/ui#wallet"
                show-signout
                @primary-action="onTopUp"
                @balance-click="onBalanceClick"
                @signout="onSignout"
              />
            </template>
          </AppDrawer>
          <div class="dev-ui__rail-stub">
            <div class="t-muted t-sm">— контент текущего раздела —</div>
            <div class="t-meta t-faint">Активный пункт: <code>{{ railActive }}</code></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 13 LAYOUT — APP HEADER (topbar) ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">13</span>
        <h2 class="dev-ui__sect-title">Шапка приложения (AppHeader)</h2>
        <p class="dev-ui__sect-sub">
          Каноничный паттерн <code>[≡] crumb · · · действия │ глобальные</code>.
          Поддерживает простой title и multi-level breadcrumb с chevron'ами.
        </p>
      </div>
      <div class="dev-ui__stage" style="padding: 0; overflow: hidden">
        <AppHeader title="Кошелёк" @toggle-menu="onMenuToggle">
          <template #actions>
            <BaseButton variant="primary" size="sm">Совершить взнос</BaseButton>
            <button class="icon-btn" aria-label="Ещё действия" type="button">⋯</button>
          </template>
          <template #notifications>
            <button class="icon-btn dev-ui__notifs" aria-label="Уведомления" type="button">
              ☷<span class="dev-ui__notifs-dot" />
            </button>
          </template>
          <template #theme>
            <ThemeToggle />
          </template>
        </AppHeader>
      </div>
      <div class="dev-ui__stage" style="padding: 0; overflow: hidden">
        <AppHeader
          :breadcrumbs="[
            { label: 'Мастерская' },
            { label: 'Проект «Восход 2025»' },
          ]"
          @toggle-menu="onMenuToggle"
        >
          <template #actions>
            <BaseButton variant="primary" size="sm">Новый взнос</BaseButton>
          </template>
          <template #notifications>
            <button class="icon-btn" aria-label="Уведомления" type="button">☷</button>
          </template>
          <template #theme>
            <ThemeToggle />
          </template>
        </AppHeader>
      </div>
    </section>

    <!-- ============ 14 LAYOUT — PAGE HEAD ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">14</span>
        <h2 class="dev-ui__sect-title">Шапка страницы (PageHead)</h2>
        <p class="dev-ui__sect-sub">
          Eyebrow + title + subtitle + actions. Используется для страниц
          без подстраниц — единственный носитель действий, если нет
          <code>PageTabs</code>.
        </p>
      </div>
      <div class="dev-ui__stage">
        <PageHead
          eyebrow="Контактные данные"
          title="Потребительский Кооператив «Восход»"
          subtitle="ИНН 9728130611 · ОГРН 124770283346 · Зарегистрирован в реестре кооперативов с 15 марта 2024 года."
        >
          <template #actions>
            <BaseButton variant="secondary" size="sm">Скопировать карточку</BaseButton>
          </template>
        </PageHead>
      </div>
    </section>

    <!-- ============ 15 LAYOUT — PAGE TABS ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">15</span>
        <h2 class="dev-ui__sect-title">Вкладки страницы (PageTabs)</h2>
        <p class="dev-ui__sect-sub">
          Подстраницы текущего раздела. Sub-action — отдельный слот справа,
          отделён hairline. Используется ВМЕСТО <code>page-head__actions</code>
          когда у страницы есть подстраницы.
        </p>
      </div>
      <div class="dev-ui__stage" style="padding: 0; overflow: hidden">
        <PageTabs :tabs="walletTabs" :active-key="walletTab" @select="(t) => (walletTab = t.key)" />
      </div>
      <div class="dev-ui__stage" style="padding: 0; overflow: hidden; margin-top: 12px">
        <PageTabs :tabs="projectTabs" :active-key="projectTab" @select="(t) => (projectTab = t.key)">
          <template #actions>
            <BaseButton variant="ghost" size="sm">Фильтр</BaseButton>
          </template>
        </PageTabs>
      </div>
    </section>

    <!-- ============ 16 LAYOUT — APP FRAME (вся связка) ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">16</span>
        <h2 class="dev-ui__sect-title">Каркас приложения</h2>
        <p class="dev-ui__sect-sub">
          AppDrawer + AppHeader + PageTabs в живой связке. Никаких legacy
          QLayout/QDrawer — только canon-разметка через layout-обёртки.
        </p>
      </div>
      <div class="dev-ui__stage" style="padding: 0; overflow: hidden">
        <div class="dev-ui__appframe">
          <AppDrawer
            coop-name="ПК «Восход»"
            coop-meta="Стол пайщика"
            :items="frameItems"
            :active-key="frameActive"
            show-cmdk
            @select="(i) => (frameActive = i.key)"
          >
            <template #footer>
              <RailUserCard
                v-model:collapsed="frameUserCollapsed"
                name="Муравьёв А.Н."
                role="Председатель совета"
                :balance="'400,00'"
                symbol="RUB"
                show-signout
                @primary-action="onTopUp"
                @signout="onSignout"
              />
            </template>
          </AppDrawer>
          <div class="dev-ui__appframe-content">
            <AppHeader title="Кошелёк">
              <template #actions>
                <BaseButton variant="primary" size="sm">Совершить взнос</BaseButton>
              </template>
              <template #notifications>
                <button class="icon-btn" aria-label="Уведомления" type="button">☷</button>
              </template>
              <template #theme>
                <ThemeToggle />
              </template>
            </AppHeader>
            <PageTabs :tabs="walletTabs" :active-key="walletTab" @select="(t) => (walletTab = t.key)" />
            <div class="dev-ui__appframe-body">
              <div class="t-sm t-muted">— содержимое вкладки —</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 17 WALLET CARD — programs × compact / full ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">17</span>
        <h2 class="dev-ui__sect-title">Кошелёк (WalletCard)</h2>
        <p class="dev-ui__sect-sub">
          Канонический <code>.wallet</code> с программным акцентом
          (<code>--prog-blagorost</code>, <code>--prog-wallet</code>,
          <code>--prog-generator</code>). Compact-вариант (<code>.wallet--row</code>)
          для слота шапки; full — для дашборда.
        </p>
      </div>

      <div class="dev-ui__stage">
        <h3 class="dev-ui__h3">Compact (для слота шапки)</h3>
        <div class="dev-ui__grid dev-ui__grid--3">
          <WalletCard
            compact
            program="blagorost"
            balance="125 400,00"
            symbol="RUB"
          />
          <WalletCard
            compact
            program="wallet"
            balance="48 250,75"
            symbol="RUB"
          />
          <WalletCard
            compact
            program="generator"
            balance="6 320,00"
            symbol="RUB"
          />
        </div>

        <h3 class="dev-ui__h3" style="margin-top: 20px">Full (дашборд)</h3>
        <div class="dev-ui__grid dev-ui__grid--2">
          <WalletCard
            program="blagorost"
            subtitle="Капитализация результатов интеллектуальной деятельности"
            balance="125 400,00"
            symbol="RUB"
            locked-balance="12 000,00"
          />
          <WalletCard
            program="wallet"
            subtitle="Свободный остаток"
            balance="48 250,75"
            symbol="RUB"
          />
          <WalletCard
            program="generator"
            subtitle="Генерация результатов интеллектуальной деятельности"
            balance="6 320,00"
            symbol="RUB"
            locked-balance="2 100,00"
          />
          <WalletCard
            program="wallet"
            subtitle="Пустой счёт"
            balance="0,00"
            symbol="RUB"
            empty
          />
        </div>

        <h3 class="dev-ui__h3" style="margin-top: 20px">Состояние loading</h3>
        <div class="dev-ui__grid dev-ui__grid--3">
          <WalletCard
            compact
            program="blagorost"
            balance=""
            symbol="RUB"
            loading
          />
          <WalletCard
            program="wallet"
            balance=""
            symbol="RUB"
            loading
          />
        </div>
      </div>
    </section>

    <!-- ============ 18 WALLET CARD MINI — connected widget ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">18</span>
        <h2 class="dev-ui__sect-title">Кошелёк · connected (WalletCardMini)</h2>
        <p class="dev-ui__sect-sub">
          <code>widgets/wallet-card-mini</code> — обёртка над WalletCard,
          подключена к Pinia <code>useWalletStore</code> и роутеру (клик →
          <code>name: 'wallet'</code>). На dev-странице store пустой (никто
          не вызвал <code>loadUserWallet</code>) — отрисуется skeleton-loading.
          На реальных страницах после init процесса покажет настоящий баланс.
        </p>
      </div>
      <div class="dev-ui__stage">
        <div class="dev-ui__grid dev-ui__grid--3">
          <WalletCardMini program="wallet" />
          <WalletCardMini program="blagorost" />
          <WalletCardMini program="generator" />
        </div>
      </div>
    </section>

    <!-- ============ 19 AUTH CARD — композит ============ -->
    <section class="dev-ui__sect">
      <div class="dev-ui__sect-head">
        <span class="dev-ui__sect-num">19</span>
        <h2 class="dev-ui__sect-title">Карточка аутентификации (AuthCard)</h2>
        <p class="dev-ui__sect-sub">
          Композит из <code>.card</code> + center-aligned head + footer-slot.
          Используется на страницах входа / восстановления / приглашения.
          AuthLayout — обёртка для full-page центрирования с тоглом темы.
        </p>
      </div>
      <div class="dev-ui__stage">
        <AuthCard
          title="Вход для пайщиков"
          subtitle="Цифровой Кооператив"
          :max-width="480"
        >
          <BaseForm>
            <BaseInput
              label="Электронная почта"
              type="email"
              placeholder="example@coop.ru"
              autocomplete="email"
            />
            <BaseInput
              label="Ключ доступа"
              type="password"
              autocomplete="current-password"
            />
            <BaseButton variant="primary" block type="submit">Войти</BaseButton>
          </BaseForm>
          <template #footer>
            <a href="#" class="t-sm t-muted">Потеряли ключ?</a>
            <span class="t-sm t-muted">·</span>
            <a href="#" class="t-sm">Нет аккаунта?</a>
          </template>
        </AuthCard>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { Dark } from 'quasar';
import { AppDrawer } from 'src/shared/ui/layout/AppDrawer';
import { AppHeader } from 'src/shared/ui/layout/AppHeader';
import { PageHead } from 'src/shared/ui/layout/PageHead';
import { PageTabs } from 'src/shared/ui/layout/PageTabs';
import { RailUserCard } from 'src/shared/ui/domain/RailUserCard';
import { WalletCard } from 'src/shared/ui/domain/WalletCard';
import { WalletCardMini } from 'src/widgets/wallet-card-mini';
import { AuthCard } from 'src/shared/ui/domain/AuthCard';
import type { RailItem, RailSection } from 'src/shared/ui/layout/AppDrawer';
import type { PageTab } from 'src/shared/ui/layout/PageTabs';

/* === Token palette ============================================================
   Подмножество --p-* токенов, формирующих визуальную идентичность.
   Меняем через input[type=color] → setProperty на documentElement —
   inline-style на :root перебивает все CSS-правила, мгновенный отклик. */
interface TokenDef {
  key: string;
  label: string;
  type: 'color' | 'rgba';
}
interface TokenGroup {
  title: string;
  items: TokenDef[];
}
const tokenGroups: TokenGroup[] = [
  {
    title: 'Акцент',
    items: [
      { key: '--p-accent', label: 'Accent', type: 'color' },
      { key: '--p-accent-hover', label: 'Accent · hover', type: 'color' },
      { key: '--p-accent-press', label: 'Accent · press', type: 'color' },
    ],
  },
  {
    title: 'Поверхности',
    items: [
      { key: '--p-canvas', label: 'Canvas (фон страницы)', type: 'color' },
      { key: '--p-canvas-2', label: 'Canvas-2', type: 'color' },
      { key: '--p-surface', label: 'Surface (карточки)', type: 'color' },
      { key: '--p-surface-2', label: 'Surface-2', type: 'color' },
      { key: '--p-surface-3', label: 'Surface-3', type: 'color' },
    ],
  },
  {
    title: 'Текст',
    items: [
      { key: '--p-ink', label: 'Ink (основной)', type: 'color' },
      { key: '--p-ink-on-accent', label: 'Ink · on-accent', type: 'color' },
    ],
  },
  {
    title: 'Линии',
    items: [
      { key: '--p-line', label: 'Line (тонкая)', type: 'rgba' },
      { key: '--p-line-1', label: 'Line-1', type: 'rgba' },
      { key: '--p-line-2', label: 'Line-2', type: 'rgba' },
    ],
  },
  {
    title: 'Статусы',
    items: [
      { key: '--p-pos', label: 'Positive', type: 'color' },
      { key: '--p-neg', label: 'Negative', type: 'color' },
      { key: '--p-warn', label: 'Warning', type: 'color' },
      { key: '--p-info', label: 'Info', type: 'color' },
    ],
  },
  {
    title: 'Программные тинты',
    items: [
      { key: '--prog-blagorost', label: 'Blagorost', type: 'color' },
      { key: '--prog-wallet', label: 'Wallet', type: 'color' },
      { key: '--prog-generator', label: 'Generator', type: 'color' },
    ],
  },
];

const resolvedValues = reactive<Record<string, string>>({});
const hexValues = reactive<Record<string, string>>({});
const overridden = reactive<Record<string, boolean>>({});

function readTokens(): void {
  if (typeof document === 'undefined') return;
  const styles = getComputedStyle(document.documentElement);
  const inlineKeys = new Set<string>();
  for (let i = 0; i < document.documentElement.style.length; i++) {
    const k = document.documentElement.style.item(i);
    if (k.startsWith('--p-') || k.startsWith('--prog-')) inlineKeys.add(k);
  }
  for (const g of tokenGroups) {
    for (const t of g.items) {
      const val = styles.getPropertyValue(t.key).trim();
      resolvedValues[t.key] = val;
      if (t.type === 'color') hexValues[t.key] = toHex(val);
      overridden[t.key] = inlineKeys.has(t.key);
    }
  }
}

function toHex(value: string): string {
  if (!value) return '#000000';
  if (value.startsWith('#')) {
    if (value.length === 4) {
      // #abc → #aabbcc
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
    }
    return value.slice(0, 7).toLowerCase();
  }
  const m = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((n) => parseInt(n, 10).toString(16).padStart(2, '0'));
    return `#${r}${g}${b}`;
  }
  return '#000000';
}

function onColorChange(key: string, hex: string): void {
  document.documentElement.style.setProperty(key, hex);
  hexValues[key] = hex;
  resolvedValues[key] = hex;
  overridden[key] = true;
}

function onTextChange(key: string, value: string): void {
  document.documentElement.style.setProperty(key, value);
  resolvedValues[key] = value;
  overridden[key] = true;
}

function resetTokens(): void {
  for (const g of tokenGroups) {
    for (const t of g.items) {
      document.documentElement.style.removeProperty(t.key);
    }
  }
  readTokens();
}

const themeName = computed(() => (Dark.isActive ? 'тёмная' : 'светлая'));
const overriddenCount = computed(() => Object.values(overridden).filter(Boolean).length);

let themeWatcher: (() => void) | null = null;
onMounted(() => {
  readTokens();
  themeWatcher = watch(() => Dark.isActive, () => readTokens());
});
onUnmounted(() => {
  themeWatcher?.();
});

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

const railItems: Array<RailItem | RailSection> = [
  {
    section: 'Раздел',
    items: [
      { key: 'wallet', label: 'Кошелёк', icon: 'account_balance_wallet' },
      { key: 'id', label: 'Удостоверение', icon: 'badge' },
      { key: 'requisites', label: 'Реквизиты', icon: 'link' },
      { key: 'docs', label: 'Документы', icon: 'description', badge: 12 },
      { key: 'pay', label: 'Платежи', icon: 'payments' },
      { key: 'meetings', label: 'Собрания', icon: 'groups' },
      { key: 'contacts', label: 'Контакты', icon: 'contacts' },
      { key: 'support', label: 'Поддержка', icon: 'support_agent' },
    ],
  },
];
const railActive = ref('wallet');

const walletTabs: PageTab[] = [
  { key: 'wallets', label: 'Кошельки', count: 3 },
  { key: 'payments', label: 'Платежи', count: 28 },
  { key: 'methods', label: 'Способы получения' },
  { key: 'plan', label: 'План платежей' },
];
const walletTab = ref('wallets');

const projectTabs: PageTab[] = [
  { key: 'desc', label: 'Описание' },
  { key: 'shares', label: 'Взносы', count: 14 },
  { key: 'members', label: 'Члены', count: 42 },
  { key: 'docs', label: 'Документы', count: 12 },
  { key: 'meetings', label: 'Собрания' },
  { key: 'decisions', label: 'Решения' },
  { key: 'history', label: 'История' },
  { key: 'settings', label: 'Настройки' },
];
const projectTab = ref('shares');

const frameItems: Array<RailItem | RailSection> = [
  {
    section: 'Раздел',
    items: [
      { key: 'wallet', label: 'Кошелёк', icon: 'account_balance_wallet' },
      { key: 'id', label: 'Удостоверение', icon: 'badge' },
      { key: 'docs', label: 'Документы', icon: 'description', badge: 12 },
      { key: 'pay', label: 'Платежи', icon: 'payments' },
    ],
  },
];
const frameActive = ref('wallet');

const railUserCollapsed = ref(false);
const frameUserCollapsed = ref(false);

function onMenuToggle(): void {
  // dev-витрина — реальный toggle живёт на странице приложения
}
function onTopUp(): void {
  // dev-витрина — открытие диалога пополнения уходит на страницу-коннектор
}
function onSignout(): void {
  // dev-витрина — реальный signout (router.push + auth.logout) на странице
}
function onBalanceClick(): void {
  // dev-витрина — на проде это router.push на страницу кошелька
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

/* ===== Layout demos ===== */
.dev-ui__rail-demo {
  display: grid;
  grid-template-columns: var(--p-rail-w, 248px) 1fr;
  min-height: 460px;
  border-radius: var(--p-r-md);
  overflow: hidden;
}
.dev-ui__rail-stub {
  background: var(--p-canvas);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dev-ui__notifs {
  position: relative;
}
.dev-ui__notifs-dot {
  position: absolute;
  top: 6px;
  right: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-neg);
}

.dev-ui__appframe {
  display: grid;
  grid-template-columns: var(--p-rail-w, 248px) 1fr;
  min-height: 520px;
  border-radius: var(--p-r-md);
  overflow: hidden;
}
.dev-ui__appframe-content {
  background: var(--p-canvas);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.dev-ui__appframe-body {
  padding: 24px 28px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== Token palette ===== */
.dev-ui__token-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--p-line);
}
.dev-ui__token-group-title {
  font-size: var(--p-fs-eyebrow);
  letter-spacing: var(--p-ls-eyebrow);
  text-transform: uppercase;
  color: var(--p-ink-3);
  font-weight: 500;
  margin: 16px 0 8px;
}
.dev-ui__token-group-title:first-child {
  margin-top: 0;
}
.dev-ui__tokens {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}
.dev-ui__token {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-sm);
  background: var(--p-surface);
  cursor: pointer;
  transition: border-color var(--p-dur-fast) ease;
}
.dev-ui__token:hover {
  border-color: var(--p-line-2);
}
.dev-ui__token--overridden {
  border-color: var(--p-accent-line);
  background: var(--p-accent-soft);
}
.dev-ui__token-swatch {
  width: 32px;
  height: 32px;
  border-radius: var(--p-r-xs);
  border: 1px solid var(--p-line-1);
  flex-shrink: 0;
}
.dev-ui__token-meta {
  min-width: 0;
  line-height: 1.2;
}
.dev-ui__token-name {
  font-size: var(--p-fs-body-sm);
  color: var(--p-ink);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dev-ui__token-key {
  font-size: 11px;
  color: var(--p-ink-3);
  font-family: var(--p-mono);
}
.dev-ui__token-picker {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--p-line-1);
  border-radius: var(--p-r-xs);
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}
.dev-ui__token-picker::-webkit-color-swatch-wrapper {
  padding: 2px;
}
.dev-ui__token-picker::-webkit-color-swatch {
  border: 0;
  border-radius: 4px;
}
.dev-ui__token-text {
  width: 140px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--p-line-1);
  border-radius: var(--p-r-xs);
  background: var(--p-surface);
  color: var(--p-ink);
  font: 11px/1.4 var(--p-mono);
  outline: none;
}
.dev-ui__token-text:focus {
  border-color: var(--p-accent);
}

.dev-ui__h3 {
  font-size: var(--p-fs-h3, 14px);
  line-height: 1.3;
  letter-spacing: 0.02em;
  font-weight: 600;
  color: var(--p-ink-2);
  margin: 0 0 12px;
  text-transform: uppercase;
}
.dev-ui__grid {
  display: grid;
  gap: 12px;
}
.dev-ui__grid--2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.dev-ui__grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 900px) {
  .dev-ui__grid--2,
  .dev-ui__grid--3 {
    grid-template-columns: 1fr;
  }
}
</style>
