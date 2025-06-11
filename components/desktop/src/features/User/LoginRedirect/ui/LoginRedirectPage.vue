<template lang="pug">
.q-pa-md.flex.flex-center
  .column.q-gutter-md(style="max-width: 400px")

    q-card(flat).q-pa-md
      .text-h6.text-center ПОЖАЛУЙСТА, ВОЙДИТЕ, ЧТОБЫ ПРОДОЛЖИТЬ
      //- .text-body1.text-center Пожалуйста, войдите в свой аккаунт, чтобы продолжить.


      login-form
</template>

<script lang="ts" setup>
import { LoginForm } from 'src/features/User/LoginUser/ui/LoginForm'
</script>
