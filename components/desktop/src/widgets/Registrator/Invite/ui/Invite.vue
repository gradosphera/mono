<template lang="pug">
AuthCard.invite(
  v-if='token',
  :max-width='560',
  title='Сохраните ключ',
  subtitle='Новый приватный ключ доступа и цифровой подписи сгенерирован для вас'
)
  p.invite__instruction
    | Пожалуйста, подтвердите надёжное сохранение ключа. Мы рекомендуем сохранить его в бесплатном менеджере паролей, таком как
    a.q-ml-xs.invite__link(href='https://bitwarden.com/download', target='_blank') Bitwarden
    | .

  .invite__key(v-if='account && account.private_key')
    BaseInput(
      :model-value='account.private_key',
      label='Приватный ключ',
      readonly,
      mono
    )
    .invite__copy
      BaseButton(variant='ghost', size='sm', @click='copyMnemonic')
        q-icon.q-mr-xs(name='content_copy', size='16px')
        | Скопировать

  .invite__confirm
    q-checkbox(v-model='i_save', label='Я сохранил ключ')

  .invite__actions
    BaseButton(
      variant='primary',
      :disabled='!i_save',
      :loading='loading',
      @click='finish'
    ) Установить ключ

AuthCard.invite(
  v-else,
  :max-width='480',
  title='Приглашение',
  subtitle='Вы получили приглашение на подключение к кооперативу'
)
  p.invite__instruction
    | Чтобы продолжить, перейдите по персональной ссылке из письма-приглашения.
    | В ней содержится одноразовый код, по которому для вас будет выпущен ключ
    | доступа.
  .invite__actions
    BaseButton(variant='ghost', @click='goToSignin') Перейти ко входу
</template>

<script lang="ts" setup>
import { copyToClipboard } from 'quasar';
import { useCreateUser } from 'src/features/User/CreateUser';
import { useResetKey } from 'src/features/User/ResetKey/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { type IGeneratedAccount } from 'src/shared/lib/types/user';
import { AuthCard } from 'src/shared/ui/domain/AuthCard';
import { BaseInput } from 'src/shared/ui/base/BaseInput';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const { generateAccount } = useCreateUser();
const account = ref<IGeneratedAccount | undefined>();

const i_save = ref(false);
const token = ref(route.query.token);
const loading = ref(false);

const { resetKey } = useResetKey();

account.value = generateAccount();

const copyMnemonic = () => {
  const toCopy = `${account.value?.private_key}`;

  copyToClipboard(toCopy)
    .then(() => {
      SuccessAlert('Ключ был скопирован в буфер обмена');
    })
    .catch((e) => {
      console.log(e);
    });
};

const goToSignin = () => {
  router.push({ name: 'signin' });
};

const finish = async () => {
  try {
    if (!account.value) {
      FailAlert('Возникла ошибка при генерации приватного ключа');
      return;
    }
    loading.value = true;
    await resetKey({
      token: token.value as string,
      public_key: account.value.public_key,
    });

    SuccessAlert('Ключ доступа успешно установлен');
    loading.value = false;

    router.push({ name: 'signin' });
  } catch (e: any) {
    loading.value = false;
    FailAlert(e);
  }
};
</script>

<style scoped>
.invite__instruction {
  color: var(--p-ink-2);
  font-size: var(--p-fs-body-sm, 13px);
  line-height: var(--p-lh-body, 1.55);
  margin: 0 0 var(--p-5, 20px);
}
.invite__link {
  color: var(--p-primary);
  text-decoration: none;
  font-weight: 500;
}
.invite__link:hover {
  text-decoration: underline;
}
.invite__key {
  margin-bottom: var(--p-5, 20px);
}
.invite__copy {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--p-1, 4px);
}
.invite__confirm {
  display: flex;
  justify-content: center;
  margin-bottom: var(--p-5, 20px);
}
.invite__actions {
  display: flex;
  justify-content: center;
}
</style>
