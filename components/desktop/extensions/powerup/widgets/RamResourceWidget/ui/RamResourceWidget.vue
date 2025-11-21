<template lang="pug">
div.ram-resource-widget
  .card-flipper(:class="{ flipped: showDetails }")
    .card-front.front
      .card-content
        .widget-header
          .widget-icon
            i.fas.fa-memory
          .widget-title Оперативная память (RAM)

        .widget-content
          q-circular-progress(
            :value="usagePercent"
            size="180px"
            :thickness="0.35"
            color="positive"
            track-color="grey-3"
            show-value
            :class="progressClass"
          )
            .progress-content
              .usage-value {{ usagePercent.toFixed(2) }}%
              .usage-label Использовано

        ColorCard(color='orange')
          | RAM используется для временного хранения данных пайщиков при исполнении смарт-контрактов.

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
            i.fas.fa-memory
          .widget-title Детали RAM

        .resource-details
          .detail-row
            .detail-label Используется:
            .detail-value {{ formatBytes(ramUsage) }}
          .detail-row
            .detail-label Доступно:
            .detail-value {{ formatBytes(available) }} ({{ availablePercent.toFixed(1) }}%)
          .detail-row
            .detail-label Квота:
            .detail-value {{ formatBytes(ramQuota) }}
          .detail-row
            .detail-label Стоимость:
            .detail-value {{ formatCost(estimatedCost) }}

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
.ram-resource-widget {
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
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

const systemStore = useSystemStore()

const ramQuota = computed(() => {
  return systemStore.info.blockchain_account?.ram_quota || 0
})

const ramUsage = computed(() => {
  return systemStore.info.blockchain_account?.ram_usage || 0
})

const available = computed(() => {
  return ramQuota.value - ramUsage.value
})

const usagePercent = computed(() => {
  if (!ramQuota.value) return 0
  return (ramUsage.value / ramQuota.value) * 100
})

const availablePercent = computed(() => {
  if (!ramQuota.value) return 0
  return (available.value / ramQuota.value) * 100
})

const progressClass = computed(() => {
  const percent = usagePercent.value
  if (percent >= 95) return 'critical-usage'
  if (percent >= 80) return 'high-usage'
  return ''
})

// Примерная оценка стоимости дополнительного RAM (упрощенная логика)
const estimatedCost = computed(() => {
  // В EOSIO RAM стоит примерно 0.01 AXON за KB (упрощенная оценка)
  const additionalKb = Math.max(0, (ramQuota.value - ramUsage.value) / 1024)
  return additionalKb * 0.01
})

const formatBytes = (bytes: number): string => {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(1) + 'GB'
  } else if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(1) + 'MB'
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(1) + 'KB'
  }
  return bytes + 'B'
}

const formatCost = (cost: number): string => {
  if (cost >= 1) {
    return cost.toFixed(2) + ' AXON'
  } else if (cost >= 0.01) {
    return cost.toFixed(4) + ' AXON'
  } else {
    return '< 0.01 AXON'
  }
}
</script>
