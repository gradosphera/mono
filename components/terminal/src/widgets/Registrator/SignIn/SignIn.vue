<template lang='pug'>
div
  q-card.signup(flat)
    div.q-pa-md
      p.text-h6.text-center.q-mb-md ВХОД ДЛЯ ПАЙЩИКОВ
        LoginForm


</template>
<script lang="ts" setup>
import { LoginForm } from 'src/features/User/LoginUser/ui/LoginForm';
</script>
