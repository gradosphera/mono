<template lang="pug">
AuthCard(:maxWidth="600")
  //- Заголовок с градиентом

  .lost-key-header
    .text-h6.lost-key-title ПЕРЕВЫПУСК КЛЮЧА
    .subtitle.text-body2.text-grey-7.q-mt-sm
      | Введите адрес электронной почты для восстановления доступа

  //- Форма восстановления
  .form-card.q-mt-xl
    form(@submit.prevent="submit").full-width
      .email-field.q-mb-md
        q-input(
          label="Электронная почта"
          v-model="email"
          outlined
          autocorrect="off"
          autocapitalize="off"
          autocomplete="off"
          spellcheck="false"
          :rules='[validateEmail]'
        )

      q-btn(
        color="primary"
        type="submit"
        :loading="loading"
        label="Продолжить"
      ).submit-btn.full-width
</template>
<script lang="ts" setup>
import { useCreateUser } from 'src/features/User/CreateUser';
import { useLostKey } from 'src/features/User/LostKey/model';

import { FailAlert } from 'src/shared/api';
import { AuthCard } from 'src/shared/ui';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('')
const loading = ref(false)

const { startResetKey } = useLostKey()
const { emailIsValid } = useCreateUser()
const isValidEmail = computed(() => emailIsValid(email.value))

const validateEmail = () => {
  return isValidEmail.value || 'Введите корректный email'
}



const router = useRouter()

const submit = async () => {
  try {
    loading.value = true
    await startResetKey({ email: email.value })
    router.push({ name: 'resetkey' })
    loading.value = false
  } catch (e: any) {
    loading.value = false
    FailAlert(e)
  }
}

</script>

<style scoped>

/* Заголовок с градиентом */
.lost-key-header {
  text-align: center;
  margin-bottom: 2rem;
}

.lost-key-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

/* Карточка формы */
.form-card {
  position: relative;
}

.email-field .q-field {
  border-radius: 12px;
}

.email-field .q-field__control {
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.02);
}

/* Кнопка отправки */
.submit-btn {
  border-radius: 12px;
  padding: 0.75rem 2rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
}

/* Адаптивность */
@media (max-width: 480px) {
  .lost-key-header {
    margin-bottom: 1.5rem;
  }

  .lost-key-title {
    font-size: 1.25rem;
  }

  .submit-btn {
    padding: 0.5rem 1.5rem;
  }
}
</style>
