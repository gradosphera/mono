<template lang="pug">
div.row.q-pa-md
  div.col-md-12.col-xs-12
    // Лоадер пока идет загрузка данных
    WindowLoader(v-if="isLoading", text="Загрузка данных подключения...")

    // Основной контент после загрузки
    div(v-else)
      div(v-if="system.info.is_providered")
        //- Показываем дашборд если установка завершена и мы на основной странице
        div(v-if="isInstallationCompleted && !isOnCompletionRoute").relative
          ConnectionDashboard

        //- Показываем степпер если идет процесс подключения
        ConnectionAgreementStepper(v-else-if="!isOnCompletionRoute")

        //- Router view для дочерних страниц (завершение установки) только на дочерних маршрутах
        router-view(v-if="isOnCompletionRoute")

      div(v-else).row
        //- Заглушка для недоступного провайдера
        div.col-md-12.col-xs-12
          ColorCard(color="blue")
            .text-center.q-pa-md
              q-icon(name="fas fa-info-circle" size="2rem").q-mb-sm
              .text-h6.q-mb-md Подключение к Кооперативной Экономике
              p Для запуска вашего Цифрового Кооператива и подключения к платформе Кооперативной Экономики обратитесь в ПК ВОСХОД.
              q-btn(
                color="primary"
                label="Перейти на сайт"
                @click="openProviderWebsite"
                size="md"
              ).q-mt-md

</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSystemStore } from 'src/entities/System/model';
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement';
import { ConnectionAgreementStepper } from 'src/widgets/ConnectionAgreementStepper';
import { ConnectionDashboard } from 'src/widgets/ConnectionDashboard';
import { ColorCard } from 'src/shared/ui';
import { WindowLoader } from 'src/shared/ui/Loader';
import { Zeus } from '@coopenomics/sdk';

const router = useRouter();
const system = useSystemStore();
const connectionAgreement = useConnectionAgreementStore();

// Лоадер состояния
const isLoading = ref(true);

// Остановка автообновления при размонтировании компонента
let stopInstanceRefresh: (() => void) | null = null;

// Редирект теперь делает только InstallationStep.vue

// Проверка завершения установки
const isInstallationCompleted = computed(() => {
  // После загрузки данных проверяем статус установки
  if (!isLoading.value) {
    const instance = connectionAgreement.currentInstance;
    return instance?.progress === 100 && instance?.status === Zeus.InstanceStatus.ACTIVE;
  }
  return false; // Во время загрузки считаем, что установка не завершена
});

// Проверка, находимся ли мы на маршруте завершения установки
const isOnCompletionRoute = computed(() => {
  return router.currentRoute.value.name === 'installation-completed';
});

// Переменная для отслеживания предыдущего состояния завершения установки
let wasInstallationCompleted = false;

// Флаг для отслеживания, был ли уже показан степпер (означает, что пользователь видел процесс установки)
let hasShownStepper = false;

// Следим за завершением установки для редиректа
watch(isInstallationCompleted, (isCompleted) => {
  // Редирект только при переходе из незавершенного состояния в завершенное
  // и только если пользователь уже видел степпер (т.е. установка шла в реальном времени)
  if (isCompleted && !wasInstallationCompleted && hasShownStepper && !isOnCompletionRoute.value) {
    console.log('🎉 Установка завершена в реальном времени! → переадресация на страницу завершения')
    router.push({ name: 'installation-completed' })
  }
  wasInstallationCompleted = isCompleted
})

// Следим за показом степпера
watch(() => !isInstallationCompleted.value && !isLoading.value && !isOnCompletionRoute.value, (isShowingStepper) => {
  if (isShowingStepper) {
    hasShownStepper = true
  }
})

const openProviderWebsite = () => {
  window.open('https://цифровой-кооператив.рф', '_blank');
};

const init = async () => {
  // Инициализация имеет смысл только если провайдер доступен
  if (!system.info.is_providered) {
    isLoading.value = false;
    return;
  }
  console.log('SYSTEM.info.is_unioned', system.info.is_unioned, connectionAgreement.isInitialized);

  // Запускаем автообновление инстанса каждые 30 секунд (включает начальную загрузку)
  // Не ждем завершения первой загрузки, чтобы избежать зависания при недоступности бэкенда
  connectionAgreement.startInstanceAutoRefresh(30000).then((stop) => {
    stopInstanceRefresh = stop;
  });

  // Даем небольшую паузу для того, чтобы данные могли загрузиться из кэша или быстро
  // Но не ждем обязательно завершения
  await new Promise(resolve => setTimeout(resolve, 100));

  // Инициализируем persistent store если он еще не инициализирован
  if (!connectionAgreement.isInitialized) {
    connectionAgreement.setInitialized(true);
  }

  const instance = connectionAgreement.currentInstance;
  const hasInstanceError = connectionAgreement.currentInstanceError;

  // Определяем шаг на основе текущего прогресса установки (при каждом заходе)

  // Сначала проверяем, была ли установка уже завершена (даже при ошибке загрузки)
  const isAlreadyCompleted = instance?.progress === 100 && instance?.status === Zeus.InstanceStatus.ACTIVE;
  if (isAlreadyCompleted) {
    console.log('✅ Установка уже завершена ранее, показываем дашборд');
    // Не меняем шаг, оставляем текущий (или устанавливаем специальный шаг для завершенной установки)
    isLoading.value = false;
    return;
  }

  if (hasInstanceError) {
    // Если есть ошибка загрузки инстанса, но установки не было завершено ранее,
    // начинаем с шага 1 по умолчанию
    console.log('❌ Ошибка загрузки инстанса, устанавливаем шаг 1 по умолчанию');
    connectionAgreement.setCurrentStep(1);
  } else if (instance && typeof instance.progress === 'number' && instance.progress > 0) {
    // Если установка уже идет (прогресс > 0), переходим к шагу установки
    console.log('🔄 Установка уже идет, прогресс:', instance.progress, '→ шаг 6');
    connectionAgreement.setCurrentStep(6);
  } else {
    // Если инстанса нет ИЛИ его прогресс = 0, определяем шаг на основе членства в союзе
    const hasNoInstance = instance === null;
    if (system.info.is_unioned) {
      // Если кооператив не является членом союза, начинаем с нулевого шага
      console.log(hasNoInstance ? 'ℹ️ Инстанс отсутствует, кооператив не в союзе → шаг 0' : '🔄 Установка не начата, кооператив не в союзе → шаг 0');
      connectionAgreement.setCurrentStep(0);
    } else {
      // Если кооператив уже член союза, начинаем с первого шага
      console.log(hasNoInstance ? 'ℹ️ Инстанс отсутствует, кооператив в союзе → шаг 1' : '🔄 Установка не начата, кооператив в союзе → шаг 1');
      connectionAgreement.setCurrentStep(1);
    }
  }

  // Скрываем лоадер после загрузки данных
  isLoading.value = false;
};

// Watch за изменением currentInstance для автоматического перехода между шагами
watch(
  () => connectionAgreement.currentInstance,
  (instance) => {
    // Не обрабатываем изменения если идет загрузка или есть ошибка
    if (connectionAgreement.currentInstanceLoading || connectionAgreement.currentInstanceError) {
      return;
    }

    if (!instance) return;

    const currentStep = connectionAgreement.currentStep;

    console.log('📊 Instance обновлен:', {
      step: currentStep,
      is_valid: instance.is_valid,
      is_delegated: instance.is_delegated,
      blockchain_status: instance.blockchain_status,
      progress: instance.progress,
      status: instance.status,
    });

    // Логика автоматических переходов (только для шагов 4, 5, 6)
    // Шаги 0, 1, 2, 3 не имеют автоматических переходов
    if (currentStep === 4) {
      // Шаг 4: Проверка домена
      if (instance.is_valid && instance.is_delegated) {
        // Домен валиден и делегирован
        if (instance.blockchain_status === 'active') {
          // Можно переходить сразу к установке
          console.log('✅ Домен готов и blockchain_status активен → переход к шагу 6');
          connectionAgreement.setCurrentStep(6);
        } else {
          // Ожидаем подтверждения от союза
          console.log('⏳ Домен готов, но ожидаем подтверждения → переход к шагу 5');
          connectionAgreement.setCurrentStep(5);
        }
      }
    } else if (currentStep === 5) {
      // Шаг 5: Ожидание подтверждения от союза
      if (instance.blockchain_status === 'active') {
        console.log('✅ Подтверждение получено → переход к шагу 6');
        connectionAgreement.setCurrentStep(6);
      }
    }
    // Редирект на страницу завершения теперь делает только InstallationStep.vue
  },
  { deep: true }
);

// Lifecycle хуки
onMounted(() => {
  // Делаем инициализацию при монтировании компонента
  init();
});

onUnmounted(() => {
  // Останавливаем автообновление инстанса при размонтировании компонента
  if (stopInstanceRefresh) {
    stopInstanceRefresh();
    stopInstanceRefresh = null;
  }
});
</script>
