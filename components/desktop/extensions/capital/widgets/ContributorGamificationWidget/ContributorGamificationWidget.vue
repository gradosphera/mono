<template lang="pug">
// Объединенный бейдж уровня и энергии
q-badge(
  :color="currentEnergy >= 90 ? 'teal' : currentEnergy >= 25 ? 'orange' : 'red'"
  flat
)
  q-icon(name='local_fire_department', size='14px', class='q-mr-xs')
  | Уровень {{ Number(contributorStore.self?.level) || 1 }}
  .q-mx-sm •
  // Компактный индикатор энергии
  .energy-compact-inline.row.items-center
    .energy-progress-container
      q-linear-progress(
        :value="currentEnergy / 100",
        :color="currentEnergy >= 90 ? 'teal' : currentEnergy >= 25 ? 'orange' : 'red'",
        track-color="grey-3",
        size="24px",
        style="width: 65px;"
        rounded
      )
      .energy-overlay.row.items-center.justify-center.full-width.q-px-xs
        q-icon(
          name="arrow_left",
          color="red",
          size="24px",
          class="energy-arrow"
        )
        .text-caption.text-white {{ currentEnergy.toFixed(0) }}%

  // Tooltip с информацией о следующем уровне
  q-tooltip
    | До следующего уровня: {{ nextLevelRequirement }} {{ info.symbols.root_govern_symbol }}
</template>

<script lang="ts" setup>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useConfigStore } from 'app/extensions/capital/entities/Config/model';
import { useSystemStore } from 'src/entities/System/model';

const contributorStore = useContributorStore();
const configStore = useConfigStore();
const { info } = useSystemStore();

// Таймер для обновления энергии каждую секунду
let energyUpdateTimer: number | null = null;

// Текущая энергия с учетом decay
const currentEnergy = ref(0);

// Функция расчета требований для уровня (из GAMIFICATION.md)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const calculateLevelRequirement = (level: number): number => {
  if (!configStore.state?.config) return 0;
  const config = configStore.state.config;
  return config.level_depth_base * Math.pow(config.level_growth_coefficient, level - 1);
};

// Функция расчета снижения энергии со временем (из GAMIFICATION.md)
const calculateEnergyDecay = (lastUpdate: Date, currentTime: Date): number => {
  if (!configStore.state?.config) return 0;
  const config = configStore.state.config;

  // Количество секунд с момента последнего обновления
  const secondsPassed = (currentTime.getTime() - lastUpdate.getTime()) / 1000;

  // Перевод в дни
  const daysPassed = secondsPassed / 86400;

  // Расчет decay (decay_rate_per_day хранится как процент, например 1.11)
  const decayRate = config.energy_decay_rate_per_day / 100; // Преобразование из процентов в десятичную дробь
  const decay = daysPassed * decayRate;

  return decay; // Возвращаем абсолютное значение decay
};

// Обновление энергии в реальном времени
const updateCurrentEnergy = () => {
  if (!contributorStore.self || !configStore.state?.config) return;

  const contributor = contributorStore.self;
  const lastUpdate = new Date(contributor.last_energy_update); // last_energy_update приходит как ISO строка
  const now = new Date();

  const decay = calculateEnergyDecay(lastUpdate, now);
  const baseEnergy = Number(contributor.energy) || 0;

  const newEnergy = Math.max(0, baseEnergy - decay);

  currentEnergy.value = newEnergy;
};

// Сумма для достижения следующего уровня (текущий уровень до 100%)
const nextLevelRequirement = computed(() => {
  if (!contributorStore.self || !configStore.state?.config) return '0';

  const contributor = contributorStore.self;
  const currentLevel = Number(contributor.level) || 1;

  // Используем текущую энергию с учетом decay
  const currentEnergyValue = currentEnergy.value;

  // Сколько энергии нужно для достижения 100%
  const energyNeeded = Math.max(0, 100 - currentEnergyValue);

  // Требования для текущего уровня
  const currentLevelRequirement = calculateLevelRequirement(currentLevel);

  // Сумма для достижения 100% энергии на текущем уровне
  const amountNeeded = (energyNeeded / 100) * currentLevelRequirement;

  return amountNeeded.toFixed(12);
});

// Запуск таймера при монтировании
onMounted(() => {
  updateCurrentEnergy(); // Первичное обновление

  // Обновление каждую секунду
  energyUpdateTimer = setInterval(() => {
    updateCurrentEnergy();
  }, 1000);
});

// Очистка таймера при размонтировании
onUnmounted(() => {
  if (energyUpdateTimer) {
    clearInterval(energyUpdateTimer);
  }
});
</script>

<style scoped>
.energy-compact-inline {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.energy-compact-inline:hover {
  opacity: 1;
}

.energy-progress-container {
  position: relative;
}

.energy-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.energy-arrow {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>
