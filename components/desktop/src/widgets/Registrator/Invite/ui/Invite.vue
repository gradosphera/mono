<template lang="pug">
AuthCard
  div(v-if="token")
      //- Заголовок с градиентом
      .invite-header
        .text-h6.invite-title СОХРАНИТЕ КЛЮЧ
        .subtitle.text-body2.text-grey-7.q-mt-sm
          | Новый приватный ключ доступа и цифровой подписи сгенерирован для вас


      //- Основная инструкция
      .instruction-card.q-mt-xl
        .instruction-text
          | Пожалуйста, подтвердите надёжное сохранение ключа. Мы рекомендуем сохранить его в бесплатном менеджере паролей, таком как
          a(href="https://bitwarden.com/download" target="_blank").q-ml-xs.bitwarden-link Bitwarden
          | .

      //- Поле ключа
      .key-field.q-mt-xl
        q-input(
          v-if='account && account.private_key',
          v-model='account.private_key',
          label='Приватный ключ',
          :readonly='true',
          outlined
        )

        //- Кнопка копирования под инпутом
        .copy-section.q-mt-md
          q-btn(
            flat,
            @click='copyMnemonic',
            icon="content_copy",
            label="Скопировать"
          ).copy-btn

      //- Чекбокс подтверждения
      .confirmation-section.q-mt-lg
        q-checkbox(v-model="i_save", label="Я сохранил ключ")

      //- Кнопка установки
      .action-buttons.q-mt-xl
        q-btn(
          :disabled="!i_save",
          @click="finish",
          color="primary",
          :loading="loading",
          label="Установить ключ"
        ).primary-btn

  div(v-else)
    //- Заголовок приглашения
    .invite-header
      .text-h6.invite-title ПРИГЛАШЕНИЕ
      .subtitle.text-body2.text-grey-7.q-mt-sm
        | Вы получили приглашение на подключение к кооперативу

</template>
<script lang="ts" setup>
import { copyToClipboard } from 'quasar';
import { useCreateUser } from 'src/features/User/CreateUser';
import { useResetKey } from 'src/features/User/ResetKey/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { type IGeneratedAccount } from 'src/shared/lib/types/user';
import { AuthCard } from 'src/shared/ui';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const { generateAccount } = useCreateUser()
const account = ref<IGeneratedAccount | undefined>()

const i_save = ref(false)
const token = ref(route.query.token)
const loading = ref(false)

const { resetKey } = useResetKey()

account.value = generateAccount()


const copyMnemonic = () => {
  const toCopy = `${account.value?.private_key}`

  copyToClipboard(toCopy)
    .then(() => {
      SuccessAlert('Ключ был скопирован в буфер обмена')
    })
    .catch((e) => {
      console.log(e)
    })
}

const finish = async () => {
  try {

    if (!account.value) {
      FailAlert('Возникла ошибка при генерации приватного ключа')
      return
    }
    loading.value = true
    await resetKey({ token: token.value as string, public_key: account.value.public_key })

    SuccessAlert('Ключ доступа успешно установлен')
    loading.value = false

    router.push({ name: 'signin' })

  } catch (e: any) {
    loading.value = false
    FailAlert(e)
  }
}

</script>

<style scoped>

/* Заголовок с градиентом */
.invite-header {
  text-align: center;
  margin-bottom: 2rem;
}

.invite-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

/* Карточка инструкции */
.instruction-card {
  padding: 1rem;
  background: rgba(25, 118, 210, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(25, 118, 210, 0.1);
  text-align: justify;
  line-height: 1.6;
}

.instruction-text {
  font-size: 0.95rem;
}

.bitwarden-link {
  color: var(--q-primary);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.bitwarden-link:hover {
  opacity: 0.8;
}

/* Поле ключа */
.key-field {
  position: relative;
}

.key-field .q-field {
  border-radius: 12px;
}

.key-field .q-field__control {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
}

/* Секция подтверждения */
.confirmation-section {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.1);
}

/* Секция копирования под инпутом */
.copy-section {
  display: flex;
  justify-content: flex-end;
}

/* Кнопки действий */
.action-buttons {
  display: flex;
  justify-content: center;
}

.copy-btn {
  border-radius: 12px;
  padding: 0.5rem 1.5rem;
  font-weight: 500;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.copy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.primary-btn {
  border-radius: 12px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  min-width: 160px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
}

.primary-btn:disabled {
  opacity: 0.6;
}

/* Адаптивность */
@media (max-width: 768px) {
  .primary-btn {
    width: 100%;
  }

  .instruction-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .invite-header {
    margin-bottom: 1.5rem;
  }

  .invite-title {
    font-size: 1.25rem;
  }

  .instruction-card {
    padding: 1rem;
  }

  .confirmation-section {
    padding: 0.75rem;
  }
}
</style>
