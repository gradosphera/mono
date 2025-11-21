<template lang="pug">
div.cpu-resource-widget
  .card-flipper(:class="{ flipped: showDetails }")
    .card-front.front
      .card-content
        .widget-header
          .widget-icon
            i.fas.fa-microchip
          .widget-title Время процессора (CPU)

        .widget-content
          q-circular-progress(
            :value="usagePercent"
            size="180px"
            :thickness="0.35"
            color="primary"
            track-color="grey-3"
            show-value
            :class="progressClass"
          )
            .progress-content
              .usage-value {{ usagePercent.toFixed(2) }}%
              .usage-label Использовано

        ColorCard(color='blue')
          | CPU расходуется для вычислений при обработке пакетов документов.

      q-btn.flip-btn(
        flat
        dense
        no-caps
        size="sm"
        label="Подробнее"
        @click="showDetails = !showDetails"
      )

    .card-back.back
      .card-content
        .widget-header
          .widget-icon
            i.fas.fa-microchip
          .widget-title Детали CPU

        .resource-details
          .detail-row
            .detail-label Используется:
            .detail-value {{ formatValue(currentUsed) }} μs
          .detail-row
            .detail-label Доступно:
            .detail-value {{ formatValue(available) }} μs ({{ availablePercent.toFixed(1) }}%)
          .detail-row
            .detail-label Максимум:
            .detail-value {{ formatValue(max) }} μs
          .detail-row
            .detail-label Восстановление:
            .detail-value ~{{ formatTime(estimatedRecovery) }}

      q-btn.flip-btn(
        flat
        dense
        no-caps
        size="sm"
        label="Назад"
        @click="showDetails = !showDetails"
      )
</template>

<style lang="scss" scoped>
.cpu-resource-widget {
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e6ed;
  transition: all 0.3s ease;
  min-width: 320px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
}

.widget-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;

  .widget-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;

    i {
      color: white;
      font-size: 1.2rem;
    }
  }

  .widget-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }
}

.widget-content {
  text-align: center;

  .q-circular-progress {
    margin: 0 auto 1.5rem;

    &.high-usage {
      ::v-deep(.q-circular-progress__track) {
        stroke: #f39c12 !important;
      }
    }

    &.critical-usage {
      ::v-deep(.q-circular-progress__track) {
        stroke: #e74c3c !important;
      }
    }
  }

  .progress-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;

    .usage-value {
      font-size: 1.1rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .usage-label {
      font-size: 0.8rem;
      margin-top: 2px;
    }
  }
}

.resource-details {
  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f3f4;

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

.card-flipper {
  position: relative;
  perspective: 1000px;
  min-height: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;

  .front,
  .back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    transition: transform 0.8s ease-in-out;
    display: flex;
    flex-direction: column;
  }

  .front {
    transform: rotateY(0deg);
  }

  .back {
    transform: rotateY(180deg);
  }

  &.flipped {
    .front {
      transform: rotateY(-180deg);
    }

    .back {
      transform: rotateY(0deg);
    }
  }
}

.card-content {
  flex: 1;
}

.flip-btn {
  margin-top: auto;
  align-self: center;
}

</style>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useSystemStore } from 'src/entities/System/model'
import { ColorCard } from 'src/shared/ui'

const showDetails = ref(false)

interface CpuLimit {
  available: string
  current_used?: string | null
  max: string
  used: string
  last_usage_update_time?: string | null
}

const systemStore = useSystemStore()

const cpuLimit = computed<CpuLimit | null>(() => {
  return systemStore.info.blockchain_account?.cpu_limit || null
})

const currentUsed = computed(() => {
  return cpuLimit.value?.current_used ? parseInt(cpuLimit.value.current_used) : 0
})

const available = computed(() => {
  return cpuLimit.value ? parseInt(cpuLimit.value.available) : 0
})

const max = computed(() => {
  return cpuLimit.value ? parseInt(cpuLimit.value.max) : 0
})

const usagePercent = computed(() => {
  if (!max.value) return 0
  return (currentUsed.value / max.value) * 100
})

const availablePercent = computed(() => {
  if (!max.value) return 0
  return (available.value / max.value) * 100
})

const progressClass = computed(() => {
  const percent = usagePercent.value
  if (percent >= 90) return 'critical-usage'
  if (percent >= 70) return 'high-usage'
  return ''
})

// Примерная оценка времени восстановления (упрощенная логика)
const estimatedRecovery = computed(() => {
  if (!cpuLimit.value) return 0
  // В EOSIO CPU восстанавливается примерно 1/3 от максимума каждые 24 часа
  // Это упрощенная оценка
  const recoveryRate = max.value / 3 / 86400 // микросекунд в секунду
  const neededRecovery = max.value - available.value
  return neededRecovery / recoveryRate
})

const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toString()
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}д ${hours % 24}ч`
  } else if (hours > 0) {
    return `${hours}ч ${minutes}м`
  } else {
    return `${minutes}м`
  }
}
</script>
