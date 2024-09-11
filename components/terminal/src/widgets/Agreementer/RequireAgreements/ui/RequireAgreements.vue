<template lang="pug">
div
  SignAgreementDialog(v-for="agreement of required_agreements" v-bind:key="agreement.type" :agreement="agreement" :is_modify="is_modify")
    AgreementReader(:agreement="agreement")
</template>

<script lang="ts" setup>
import { SignAgreementDialog } from 'src/features/Agreementer/SignAgreementDialog';
import { useAgreementStore } from 'src/entities/Agreement';
import { COOPNAME } from 'src/shared/config';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { AgreementReader } from 'src/features/Agreementer/GenerateAgreement';
import { useWalletStore } from 'src/entities/Wallet';
import { useSessionStore } from 'src/entities/Session';

const route = useRoute()
const agreementer = useAgreementStore()
const wallet = useWalletStore()

const required = computed(() => (route.meta?.agreements || []))//TODO change to agreements

const userAgreements = computed(() => wallet.agreements)
const templates = computed(() => agreementer.agreementsTemplates)
const cooperativeAgreements = computed(() => agreementer.cooperativeAgreements)
const is_modify=ref(false)

// Для всех соглашений, которые пользователь должен подписать
const required_agreements = computed(() => {
  // Получаем подписанные соглашения

  // Фильтруем соглашения, которые необходимы пользователю
  return cooperativeAgreements.value.filter(agreement => {
    // Условие: тип соглашения должен быть в required.value
    if (required.value.includes(agreement.type)) {
      // Найти, если пользователь уже подписал это соглашение
      const userAgreement = userAgreements.value.find(ua => ua.type === agreement.type);

      if (userAgreement) {
        // Найти соответствующий шаблон для соглашения
        const template = templates.value.find(t => t.registry_id === agreement.draft_id);

        // Проверить, если версия подписанного соглашения у пользователя отличается от последнего шаблона
        if (template && template.version !== userAgreement.version) {
          is_modify.value = true
          return true; // Добавить соглашение в список
        }
      } else {
        return true; // Пользователь ещё не подписал соглашение
      }
    }
    return false; // Убрать соглашение из списка
  });
});

const init = async () => {
  agreementer.loadCooperativeAgreements(COOPNAME)
  agreementer.loadAgreementTemplates(COOPNAME)
}
const session = useSessionStore()

watch(() => session.isAuth, (newValue) => {
  if(newValue)
    init()
})

init()

</script>
