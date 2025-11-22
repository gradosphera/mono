<template lang="pug">
div.logs-page
  ExtensionLogsList(extension-name="powerup")
    template(#log-item="{ log }")
      PowerupLogItem(:log="log")
</template>

<script lang="ts" setup>
import { ExtensionLogsList } from 'src/widgets/ExtensionLogsList'
import { PowerupLogItem } from '../../../widgets/PowerupLogItem'
</script>

<style lang="scss" scoped>
.logs-page {
  height: 100%;
}
</style>
