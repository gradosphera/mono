<template lang="pug">
div.log-details
  .detail-row
    .detail-label Тип операции:
    .detail-value
      q-chip(
        :color="getTypeColor(log.type)"
        text-color="white"
        size="sm"
        dense
      ) {{ getTypeLabel(log.type) }}

  .detail-row
    .detail-label Сумма:
    .detail-value {{ log.amount }}

  .detail-row
    .detail-label RAM:
    .detail-value {{ formatBytes(log.resources.ram_usage) }} / {{ formatBytes(log.resources.ram_quota) }} ({{ calculateRamPercent(log.resources.ram_usage, log.resources.ram_quota).toFixed(2) }}% использовано)

  .detail-row
    .detail-label CPU:
    .detail-value {{ formatCpuNet(log.resources.cpu_limit) }} ({{ calculateCpuNetPercent(log.resources.cpu_limit).toFixed(2) }}% использовано)

  .detail-row
    .detail-label NET:
    .detail-value {{ formatCpuNet(log.resources.net_limit) }} ({{ calculateCpuNetPercent(log.resources.net_limit).toFixed(2) }}% использовано)
</template>

<script lang="ts" setup>

interface PowerupLog {
  type: 'daily' | 'now'
  amount: string
  timestamp?: string
  resources: {
    username: string
    ram_usage: any
    ram_quota: any
    net_limit: any
    cpu_limit: any
  }
}

interface Props {
  log: PowerupLog
}

defineProps<Props>()

const getTypeLabel = (type: string) => {
  return type === 'daily' ? 'Ежедневное пополнение' : 'Немедленное пополнение'
}

const getTypeColor = (type: string) => {
  return type === 'daily' ? 'green' : 'blue'
}

const formatBytes = (value: any) => {
  if (!value) return '0 B'
  const bytes = typeof value === 'string' ? parseInt(value) : value
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatCpuNet = (resource: any) => {
  if (!resource || typeof resource !== 'object') return 'N/A'

  const available = resource.available || resource.current_used || 0
  const max = resource.max || 0

  return `${formatBytes(available)} / ${formatBytes(max)}`
}

const calculateRamPercent = (usage: any, quota: any) => {
  const usageNum = typeof usage === 'string' ? parseInt(usage) : usage || 0
  const quotaNum = typeof quota === 'string' ? parseInt(quota) : quota || 0

  if (!quotaNum) return 0
  return (usageNum / quotaNum) * 100
}

const calculateCpuNetPercent = (resource: any) => {
  if (!resource || typeof resource !== 'object') return 0

  const currentUsed = resource.current_used || 0
  const max = resource.max || 0

  if (!max) return 0
  return (parseInt(currentUsed) / parseInt(max)) * 100
}
</script>

<style lang="scss" scoped>
.log-details {
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(241, 243, 244, 0.3);

    &:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: 0.85rem;
      font-weight: 500;
    }

    .detail-value {
      font-size: 0.85rem;
      font-weight: 600;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    }
  }
}
</style>
