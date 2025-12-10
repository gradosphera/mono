<template lang="pug">
AuthCard(:maxWidth="600")
  .text-h6.text-center ПОЖАЛУЙСТА, ВОЙДИТЕ, ЧТОБЫ ПРОДОЛЖИТЬ
  //- .text-body1.text-center Пожалуйста, войдите в свой аккаунт, чтобы продолжить.

  login-form
</template>

<script lang="ts" setup>
import { LoginForm } from 'src/features/User/LoginUser/ui/LoginForm'
import { AuthCard } from 'src/shared/ui'
</script>
