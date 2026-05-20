<template>
  <div class="left-drawer-menu">
    <AppDrawer
      :items="railItems"
      :active-key="activeKey"
      :coop-name="coopShortName"
      :coop-meta="coopMeta"
      :show-cmdk="true"
      cmdk-label="Найти"
      cmdk-hint="Поиск (⌘K)"
      class="left-drawer-menu__rail"
      @select="onSelect"
      @cmdk="onCmdk"
    >
      <template #footer>
        <RailUserCard
          v-if="walletReady"
          :name="userName"
          :role="userRoleLabel"
          :balance="walletBalance"
          :symbol="walletSymbol"
          :locked-balance="walletLocked"
          :balance-route="{ name: 'wallet', params: { coopname: info.coopname } }"
          primary-action-label="Пополнить"
          show-signout
          signout-label="Выйти"
          @primary-action="onDeposit"
          @signout="onLogout"
        />
      </template>
    </AppDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { useWalletStore } from 'src/entities/Wallet';
import { useActionsStore } from 'src/shared/lib/stores/actions.store';
import { useLogoutUser } from 'src/features/User/Logout';
import { FailAlert } from 'src/shared/api';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { AppDrawer } from 'src/shared/ui/layout/AppDrawer';
import type { RailItem } from 'src/shared/ui/layout/AppDrawer';
import { RailUserCard } from 'src/shared/ui/domain/RailUserCard';

const router = useRouter();
const desktop = useDesktopStore();
const session = useSessionStore();
const systemStore = useSystemStore();
const { info } = systemStore;
const walletStore = useWalletStore();
const actionsStore = useActionsStore();

// --- Адаптер: activeSecondLevelRoutes → RailItem[] -------------------------

const userRole = computed<'chairman' | 'member' | 'user'>(() =>
  session.isChairman ? 'chairman' : session.isMember ? 'member' : 'user',
);

const filterContext = computed(() => {
  const acc = session.currentUserAccount?.private_account;
  const isCoop =
    acc?.type === Zeus.AccountType.organization &&
    acc.organization_data &&
    'type' in acc.organization_data &&
    acc.organization_data.type.toUpperCase() === Zeus.OrganizationType.COOP;
  return {
    isCoop,
    userRole: userRole.value,
    userAccount: acc,
    coopname: info.coopname,
    isOnboardingHidden:
      localStorage.getItem('chairman-onboarding-hidden') === 'true',
  };
});

function evalCondition(
  condition: string | undefined,
  ctx: Record<string, unknown>,
): boolean {
  if (!condition) return true;
  try {
    const fn = new Function(...Object.keys(ctx), `return ${condition};`);
    return Boolean(fn(...Object.values(ctx)));
  } catch (e) {
    console.error('Error evaluating route condition:', e);
    return false;
  }
}

interface MenuMeta {
  title?: string;
  icon?: string;
  roles?: string[];
  conditions?: string;
  hidden?: boolean;
  action?: string;
}

const filteredRoutes = computed<RouteRecordRaw[]>(() => {
  const ctx = filterContext.value;
  return (desktop.activeSecondLevelRoutes as RouteRecordRaw[]).filter((r) => {
    const meta = (r.meta ?? {}) as MenuMeta;
    const rolesOk =
      !meta.roles ||
      meta.roles.length === 0 ||
      meta.roles.includes(ctx.userRole);
    const condOk = evalCondition(meta.conditions, ctx);
    const visibleOk = !meta.hidden;
    return rolesOk && condOk && visibleOk;
  });
});

const railItems = computed<RailItem[]>(() =>
  filteredRoutes.value.map((r) => {
    const meta = (r.meta ?? {}) as MenuMeta;
    return {
      key: String(r.name),
      label: meta.title ?? String(r.name),
      icon: meta.icon,
    };
  }),
);

// --- Активный пункт через router -------------------------------------------

const activeKey = computed<string | undefined>(() => {
  const current = router.currentRoute.value;
  const currentName = current.name as string | undefined;
  if (!currentName) return undefined;

  for (const r of filteredRoutes.value) {
    if (r.name === currentName) return String(r.name);
    if (current.matched.some((m) => m.name === r.name)) return String(r.name);
    // Группа маршрутов: project-* → projects-list
    if (r.name === 'projects-list' && currentName.startsWith('project-')) {
      return String(r.name);
    }
  }
  return undefined;
});

// --- Навигация -------------------------------------------------------------

function onSelect(item: RailItem): void {
  const route = filteredRoutes.value.find((r) => String(r.name) === item.key);
  if (!route) return;
  const meta = (route.meta ?? {}) as MenuMeta;
  if (meta.action) {
    actionsStore.executeAction(meta.action);
    desktop.closeLeftDrawerOnMobile();
    return;
  }
  void router.push({
    name: route.name,
    params: { coopname: info.coopname },
  });
  desktop.closeLeftDrawerOnMobile();
}

function onCmdk(): void {
  // CmdkMenu смонтирован в default.vue и реагирует на ⌘K/keyboard.
  // Здесь имитируем нажатие тех же клавиш через keyboard event.
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true }),
  );
}

// --- Шапка рейла (бренд) ---------------------------------------------------

const coopShortName = computed<string>(
  () => info.vars?.short_abbr || info.coopname || 'Кооператив',
);
const coopMeta = computed<string | undefined>(() =>
  info.vars?.name && info.vars.name !== coopShortName.value
    ? info.vars.name
    : undefined,
);

// --- Footer: RailUserCard (canon .rail__usercard) --------------------------

const mainWallet = computed(() =>
  walletStore.program_wallets.find((w) => w.program_type === Zeus.ProgramType.MAIN),
);
const walletReady = computed<boolean>(() => walletStore.program_wallets.length > 0);

function splitAsset(asset?: string | null): { amount: string; symbol: string } {
  if (!asset) return { amount: '0,00', symbol: '' };
  const formatted = formatAsset2Digits(asset);
  const parts = formatted.split(' ');
  return { amount: parts[0] || '0,00', symbol: parts[1] || '' };
}

const walletAvail = computed(() => splitAsset(mainWallet.value?.available));
const walletBalance = computed<string>(() => walletAvail.value.amount);
const walletSymbol = computed<string>(
  () => walletAvail.value.symbol || info.symbols?.root_govern_symbol || 'RUB',
);
const walletLocked = computed<string | undefined>(() => {
  const split = splitAsset(mainWallet.value?.blocked);
  if (split.amount === '0,00' || split.amount === '0.00') return undefined;
  return split.amount;
});

const userName = computed<string>(() => {
  const acc = session.currentUserAccount?.private_account;
  if (!acc) return 'Пайщик';
  if (acc.type === Zeus.AccountType.organization) {
    const od = acc.organization_data as { short_name?: string; name?: string } | undefined;
    return od?.short_name || od?.name || 'Организация';
  }
  const id = acc.individual_data as
    | { first_name?: string; last_name?: string }
    | undefined;
  if (id?.first_name || id?.last_name) {
    return [id?.last_name, id?.first_name].filter(Boolean).join(' ').trim();
  }
  return session.username || 'Пайщик';
});
const userRoleLabel = computed<string>(() =>
  session.isChairman ? 'Председатель' : session.isMember ? 'Пайщик' : 'Гость',
);

function onDeposit(): void {
  actionsStore.executeAction('deposit');
}

async function onLogout(): Promise<void> {
  const { logout: doLogout } = useLogoutUser();
  try {
    await doLogout();
    void router.push({ name: 'signin' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    FailAlert('Ошибка при выходе: ' + msg);
  }
}
</script>

<style scoped>
.left-drawer-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.left-drawer-menu__rail {
  height: 100%;
}

/* Сужаем canon-margin .rail__usercard с 16px до 8px чтобы выровнять
   левый край кошелька с пунктами меню (.rail__nav padding 0 8px). */
.left-drawer-menu :deep(.rail__usercard) {
  margin: 12px 8px;
}
/* Также сужаем canon-padding .rail__signout с 12px 20px до 12px 12px,
   чтобы кнопка «Выйти» не торчала глубже остальных пунктов. */
.left-drawer-menu :deep(.rail__signout) {
  padding: 12px 12px;
}
</style>
