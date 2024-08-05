<template lang="pug">
q-card(flat bordered).q-pa-md
  span.text-h6  Выход из Кооператива
  div
    span После рассмотрения Советом вашего заявления о выходе из Кооператива, вам будет возвращен минимальный паевый взнос, а Вы будете исключены из реестра пайщиков кооператива.
  q-btn(color="red" @click="exit").q-mt-md
    q-icon( color="white" name="send")
    span.q-ml-sm Отправить заявление
</template>
<script lang="ts" setup>

const exit = () => {
  console.log('on exit')
}
</script>
