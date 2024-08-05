<template lang="pug">
div
q-card(flat bordered).q-pa-md
  span.text-h6 Выход из Приложения
  div
    span Для повторного входа потребуется ввести ключ доступа, выданный при регистрации.
  q-btn(color="orange" @click="logout").q-mt-md
    q-icon( color="white" name="logout")
    span.q-ml-sm Выйти

</template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useLogoutUser } from 'src/features/User/Logout/model'
import { FailAlert } from 'src/shared/api';

const router = useRouter()

const logout = async () => {
  const { logout } = useLogoutUser()

  try {
    await logout()
    router.push({ name: 'index' })

  } catch (e: any) {
    FailAlert('Ошибка при выходе: ' + e.message)
  }
}

</script>
