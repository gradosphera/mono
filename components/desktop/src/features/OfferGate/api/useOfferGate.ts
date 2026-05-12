import { computed, ref, watch } from 'vue';
import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { OfferGateProps } from '../model/types';

/**
 * Composable, проверяющий по on-chain `agreements`, подписала ли пайщица/пайщик
 * оферту указанного типа в указанном кооперативе.
 *
 * Использует SDK Queries.Agreements.Agreements с фильтром
 * `{ coopname, username, type }` и считает подписанной любую запись со
 * `status !== 'declined'` — REGISTERED уже достаточно для L3-входа в
 * расширение (CONFIRMED — после ратификации советом).
 *
 * Симметрично контракту платформенного `AgreementSignaturePort` на бэке
 * (план C28-10 раздел 3.1), чтобы UI-gate и backend-гейт давали один и
 * тот же вердикт без расхождения.
 */
export function useOfferGate(props: () => OfferGateProps) {
  const isLoading = ref(true);
  const hasSigned = ref(false);
  const error = ref<Error | null>(null);

  const refresh = async () => {
    const { coopname, username, agreementType } = props();
    if (!coopname || !username || !agreementType) {
      isLoading.value = false;
      hasSigned.value = false;
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const response = await client.Query(Queries.Agreements.Agreements.query, {
        variables: {
          filter: {
            coopname,
            username,
            type: agreementType,
          },
          options: { page: 1, limit: 1, sortOrder: 'DESC' },
        },
      });

      const items = response.agreements?.items ?? [];
      hasSigned.value = items.some((a) => a?.status && a.status !== 'DECLINED');
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e));
      hasSigned.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  watch(
    () => {
      const p = props();
      return [p.coopname, p.username, p.agreementType] as const;
    },
    () => {
      void refresh();
    },
    { immediate: true }
  );

  const isBlocked = computed(() => !isLoading.value && !hasSigned.value);

  return { isLoading, hasSigned, isBlocked, error, refresh };
}
