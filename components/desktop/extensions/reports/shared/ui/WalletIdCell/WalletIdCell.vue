<template lang="pug">
span(v-if='walletId === null || walletId === undefined').text-grey-6 —
span.wallet-id-cell(v-else)
  EntityIdBadge(
    :rawId='walletId'
    copy-on-click
  )
  q-tooltip(v-if='tooltipText' anchor='top middle' self='bottom middle') {{ tooltipText }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EntityIdBadge } from 'src/shared/ui'
import { getWalletName } from 'src/shared/lib/ledger2'

const props = defineProps<{
  walletId: number | null | undefined
}>()

const tooltipText = computed(() => {
  if (props.walletId === null || props.walletId === undefined) return ''
  const name = getWalletName(props.walletId)
  return name ? `${name} (клик — копировать)` : 'Клик — копировать'
})
</script>
