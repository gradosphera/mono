<template lang='pug'>
AuthCard(:maxWidth="800")
  //- Заголовок с градиентом

  .signin-header
    .text-h6.signin-title ВХОД ДЛЯ ПАЙЩИКОВ
    .subtitle.text-body2.text-grey-7.q-mt-sm
      | цифрового кооператива

  //- Форма входа
  .login-form-container.q-mt-xl
    LoginForm
</template>
<script lang="ts" setup>
import { LoginForm } from 'src/features/User/LoginUser/ui/LoginForm';
import { AuthCard } from 'src/shared/ui';
</script>

<style scoped>

/* Заголовок с градиентом */
.signin-header {
  text-align: center;
  margin-bottom: 2rem;
}

.signin-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

/* Контейнер формы входа */
.login-form-container {
  position: relative;
}

/* Адаптивность */
@media (max-width: 480px) {
  .signin-header {
    margin-bottom: 1.5rem;
  }

  .signin-title {
    font-size: 1.25rem;
  }
}
</style>
