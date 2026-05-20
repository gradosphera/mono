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
        <transition name="slide">
          <div
            v-show="isBottomSectionExpanded !== null && isBottomSectionExpanded"
            class="left-drawer-menu__foot"
          >
            <MicroWallet />
            <div class="left-drawer-menu__logout">
              <LogoutButton />
            </div>
          </div>
        </transition>
        <div class="left-drawer-menu__toggle">
          <q-btn
            v-if="isBottomSectionExpanded !== null"
            flat
            dense
            round
            size="sm"
            :icon="isBottomSectionExpanded ? 'expand_more' : 'expand_less'"
            @click="toggleBottomSection"
          >
            <q-tooltip>
              {{ isBottomSectionExpanded ? 'Свернуть' : 'Развернуть' }}
            </q-tooltip>
          </q-btn>
          <div v-else class="left-drawer-menu__toggle-ph" />
        </div>
      </template>
    </AppDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { useActionsStore } from 'src/shared/lib/stores/actions.store';
import { AppDrawer } from 'src/shared/ui/layout/AppDrawer';
import type { RailItem } from 'src/shared/ui/layout/AppDrawer';
import { LogoutButton } from 'src/features/User/Logout';
import { MicroWallet } from 'src/widgets/Wallet';

const STORAGE_KEY_BOTTOM_SECTION = 'monocoop-left-drawer-bottom-expanded';

const router = useRouter();
const desktop = useDesktopStore();
const session = useSessionStore();
const { info } = useSystemStore();
const actionsStore = useActionsStore();

const isBottomSectionExpanded = ref<boolean | null>(null);

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY_BOTTOM_SECTION);
  isBottomSectionExpanded.value = saved !== null ? saved === 'true' : true;
});

function toggleBottomSection(): void {
  isBottomSectionExpanded.value = !isBottomSectionExpanded.value;
  localStorage.setItem(
    STORAGE_KEY_BOTTOM_SECTION,
    String(isBottomSectionExpanded.value),
  );
}

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
.left-drawer-menu__foot {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 16px;
}
.left-drawer-menu__logout {
  margin-top: 4px;
}
.left-drawer-menu__toggle {
  display: flex;
  justify-content: center;
  padding: 6px 0 8px;
}
.left-drawer-menu__toggle-ph {
  width: 32px;
  height: 32px;
}

/* slide-анимация раскрытия нижнего блока (сохраняем поведение legacy) */
.slide-enter-active { transition: all 0.3s ease-out; overflow: hidden; }
.slide-leave-active { transition: all 0.25s ease-in; overflow: hidden; }
.slide-enter-from { opacity: 0; transform: translateY(12px); }
.slide-enter-to { opacity: 1; transform: translateY(0); }
.slide-leave-from { opacity: 1; transform: translateY(0); }
.slide-leave-to { opacity: 0; transform: translateY(12px); }
</style>
