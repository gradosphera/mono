import { computed } from 'vue';
import { useSessionStore } from 'src/entities/Session/model/store';
import { useSystemStore } from 'src/entities/System/model';

export const useReferralLink = () => {
  const sessionStore = useSessionStore();
  const systemStore = useSystemStore();

  const referralLink = computed(() => {
    const info = systemStore.info;
    const username = sessionStore.username;
    if (!info || !username) return '';

    const isHashRouter = process.env.VUE_ROUTER_MODE === 'hash';
    const base = window.location.origin;

    if (isHashRouter) {
      return `${base}/#/${info.coopname}/auth/signup?r=${username}`;
    }

    const url = new URL('/', base);
    url.searchParams.set('r', username);
    return url.toString();
  });

  return {
    referralLink,
  };
};
