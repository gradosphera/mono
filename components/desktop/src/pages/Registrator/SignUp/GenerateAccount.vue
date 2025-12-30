<template lang="pug">
div
  q-step(
    :name='store.steps.GenerateAccount',
    title='Получите приватный ключ и надежно сохраните его для цифровой подписи',
    :done='store.isStepDone("GenerateAccount")'
  )
    div
      p.full-width Приватный ключ используется для входа в систему и подписи документов. Мы рекомендуем сохранить его в бесплатном менеджере паролей, таком как
        a.q-ml-xs(href='https://bitwarden.com/download', target='_bank') Bitwarden
        | .

    q-input.q-mt-lg(
      ref='privateKeyInput',
      v-if='account.private_key',
      :model-value='account.private_key',
      label='Приватный ключ'
    )

    q-checkbox(v-model='i_save', label='Я сохранил ключ в надёжном месте')

    .q-mt-lg
      q-btn.col-md-6.col-xs-12(flat, @click='store.prev()')
        i.fa.fa-arrow-left
        span.q-ml-md назад

      q-btn.col-md-6.col-xs-12(flat, @click='copyMnemonic')
        i.fa.fa-copy
        span.q-ml-md скопировать

      q-btn.q-mt-lg.q-mb-lg(
        color='primary',
        :disabled='!i_save',
        :loading='isLoading',
        @click='setAccount'
      )
        | Продолжить
        q-tooltip подтвердите сохранение ключа для продолжения
</template>
<script lang="ts" setup>
import { ref, computed, nextTick, watch } from 'vue';
import { useCreateUser } from 'src/features/User/CreateUser';
import { copyToClipboard } from 'quasar';
import { useRegistratorStore } from 'src/entities/Registrator';
import { SuccessAlert } from 'src/shared/api';
import { Classes } from '@coopenomics/sdk';
import { updateOpenReplayUser } from 'src/shared/config';
import { useSystemStore } from 'src/entities/System/model';

const store = useRegistratorStore();
const system = useSystemStore();

import { FailAlert } from 'src/shared/api';

const api = useCreateUser();
const i_save = ref(false);
const account = ref(store.state.account);
const privateKeyInput = ref<any>();
const isLoading = ref(false);

if (
  !account.value.private_key ||
  !account.value.public_key ||
  !account.value.username
)
  account.value = new Classes.Account();

const email = computed(() => store.state.email);
const userData = computed(() => store.state.userData);

// Автоматическое выделение приватного ключа при его генерации
watch(
  () => account.value.private_key,
  (newKey) => {
    if (newKey) {
      nextTick(() => {
        privateKeyInput.value?.select();
      });
    }
  },
  { immediate: true },
);

const copyMnemonic = () => {
  const toCopy = `${account.value.private_key}`;

  copyToClipboard(toCopy)
    .then(() => {
      SuccessAlert('Приватный ключ скопирован в буфер обмена');
    })
    .catch((e) => {
      console.log(e);
    });
};

const setAccount = async () => {
  isLoading.value = true;
  try {
    await api.createUser(email.value, userData.value, account.value);
    store.state.account = account.value;

    // Обновляем username в OpenReplay tracker после создания пользователя
    updateOpenReplayUser({
      username: account.value.username,
      coopname: system.info.coopname,
      cooperativeDisplayName: system.cooperativeDisplayName,
    });

    if (store.isBranched) store.goTo('SelectBranch');
    else store.goTo('ReadStatement');
  } catch (e: any) {
    store.goTo('SetUserData');
    console.error(e);
    FailAlert(e);
  } finally {
    isLoading.value = false;
  }
};
</script>
