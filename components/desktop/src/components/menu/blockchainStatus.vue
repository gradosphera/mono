<template lang="pug">
div.footer-root.blockinfo.no-select
  div(v-if="missedConnection")
    i(style="color: red").far.fa-circle
    div
      span нет
    div
      span соединения
  div(v-else)
    i(style="color: green").far.fa-circle
    div
      span блок №
    div
      span {{ currentBlock }}

</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import config from 'src/app/config'
import { useSessionStore } from 'src/entities/Session'

const session = useSessionStore()

const intervalId = ref()

if (config.production)
  intervalId.value = setInterval(() => {
    session.getInfo()
  }, 1000)

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
})

let currentBlock = computed(() => {
  return session.BCInfo.info?.head_block_num
})

let missedConnection = computed(() => {
  return session.BCInfo.connected
})

</script>

<style lang="scss">
.footer-root {
  text-align: center;
}

.blockinfo {
  width: 100%;
  text-align: center;
  position: absolute;
  bottom: 10px;
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 16px;
  color: #8a8a8a;
}

.logout {
  cursor: pointer;

  &:hover .logout-text {
    text-decoration: underline;
  }

  .logout-text {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: #181818;
    vertical-align: bottom;
    display: inline-block;
    padding-left: 10px;
  }
}
</style>
src/app/config
