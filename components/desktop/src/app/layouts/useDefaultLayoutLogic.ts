import { computed, ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';
import { useWindowSize } from 'vue-window-size';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { useCurrentUser } from 'src/entities/Session';
import { useCooperativeStore } from 'src/entities/Cooperative';

export function useDefaultLayoutLogic() {
  const $q = useQuasar();
  const { width } = useWindowSize();
  const route = useRoute();
  const session = useSessionStore();
  const currentUser = useCurrentUser();
  const cooperativeStore = useCooperativeStore();
  const system = useSystemStore();

  cooperativeStore.loadContacts();

  const leftDrawerOpen = ref(true);
  const isMobile = computed(() => width.value < 768);
  const isDark = computed(() => $q.dark.isActive);
  const headerClass = computed(() =>
    isDark.value ? 'text-white bg-dark' : 'text-black bg-light',
  );

  const isRegistrationComplete = computed(
    () => currentUser.isRegistrationComplete.value,
  );

  const loggedIn = computed(
    () => isRegistrationComplete.value && session.isAuth,
  );
  const showDrawer = computed(
    () => route.params.coopname === system.info.coopname,
  );

  const footerText = computed(() => {
    const c = cooperativeStore.contacts;
    const d = c?.details;
    return d
      ? `${c.full_name}, ИНН: ${d.inn}, ОГРН: ${d.ogrn}, телефон: ${c.phone}, почта: ${c.email}`
      : '';
  });

  onMounted(() => {
    if (isMobile.value || !loggedIn.value) {
      leftDrawerOpen.value = false;
    }
  });

  watch(loggedIn, (v) => {
    leftDrawerOpen.value = v;
  });

  const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value;
  };

  return {
    leftDrawerOpen,
    isMobile,
    loggedIn,
    isRegistrationComplete,
    showDrawer,
    headerClass,
    footerText,
    toggleLeftDrawer,
  };
}
