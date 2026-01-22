<template lang="pug">
div
  q-step(
    :name='store.steps.SignStatement',
    title='Подпишите заявление на вступление',
    :done='store.isStepDone("SignStatement")'
  )
    div(v-if='onSign')
      Loader(:text='loadingText')

    div(v-else)
      // Контейнер, внутри которого класс Canvas создаёт <canvas>
      .signature-container(
        v-if='!onSign',
        ref='around'
        :class='{ "signature-started": signatureStarted }'
      )
        p.signature-hint Оставьте собственноручную подпись в рамке
      .q-mt-lg.q-mb-lg
        q-btn.col-md-4.col-xs-12(flat, @click='store.prev()')
          i.fa.fa-arrow-left
          span.q-ml-md назад
        q-btn.col-md-4.col-xs-12(flat, @click='clearCanvas')
          span.q-ml-md очистить
        q-btn.col-md-4.col-xs-12(
          color='primary',
          label='Продолжить',
          @click='setSignature'
        )
</template>

<script lang="ts" setup>
import { ref, onBeforeUnmount, watch, nextTick } from 'vue';
import { FailAlert } from 'src/shared/api';
import { Loader } from 'src/shared/ui/Loader';
import { useRegistratorStore } from 'src/entities/Registrator';
import { useCreateUser } from 'src/features/User/CreateUser';

// Импортируем класс
import { Classes } from '@coopenomics/sdk';
import { client } from 'src/shared/api/client';

const store = useRegistratorStore();
const createUser = useCreateUser();

const around = ref<HTMLElement | null>(null);
const onSign = ref(false);
const loadingText = ref('');
const signatureStarted = ref(false);

// Экземпляр Canvas
let canvasClass: Classes.Canvas | null = null;

/**
 * Инициализация Canvas с задержкой
 */
const initCanvas = () => {
  // Ждём 200ms, чтобы Quasar завершил рендеринг
  setTimeout(() => {
    if (around.value) {
      canvasClass = new Classes.Canvas(around.value, {
        lineWidth: 5,
        strokeStyle: getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim() || '#1976d2',
      });

      // Добавляем обработчик первого взаимодействия
      const canvas = canvasClass.canvas;
      const startSignature = () => {
        signatureStarted.value = true;
        canvas.removeEventListener('mousedown', startSignature);
        canvas.removeEventListener('touchstart', startSignature);
      };

      canvas.addEventListener('mousedown', startSignature);
      canvas.addEventListener('touchstart', startSignature);
    }
  }, 200);
};

/**
 * Следим за текущим шагом
 * Используем immediate: true вместо отдельного onMounted
 */
watch(
  () => store.state.step,
  (newStep) => {
    if (newStep === store.steps.SignStatement) {
      signatureStarted.value = false;
      nextTick(() => initCanvas());
    }
  },
  { immediate: true }
);

/**
 * При размонтировании снимаем слушатели
 */
onBeforeUnmount(() => {
  canvasClass?.destroy();
});

/**
 * Очистка холста
 */
const clearCanvas = () => {
  canvasClass?.clearCanvas();
  signatureStarted.value = false;

  // Переустанавливаем обработчики событий после очистки
  if (canvasClass?.canvas) {
    const canvas = canvasClass.canvas;
    const startSignature = () => {
      signatureStarted.value = true;
      canvas.removeEventListener('mousedown', startSignature);
      canvas.removeEventListener('touchstart', startSignature);
    };

    canvas.addEventListener('mousedown', startSignature);
    canvas.addEventListener('touchstart', startSignature);
  }
};

/**
 * Получение подписи + проверка пустоты
 */
const setSignature = async () => {
  if (!canvasClass) {
    FailAlert('Пожалуйста, оставьте собственноручную подпись в окне');
    return;
  }

  const sign = canvasClass.getSignature();
  // Проверим, есть ли хоть один ненулевой пиксель
  const ctx = canvasClass.ctx;
  const { width, height } = canvasClass.canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  const isEmpty = !data.some((channel) => channel !== 0);

  if (!sign || isEmpty) {
    FailAlert('Пожалуйста, оставьте собственноручную подпись в окне');
    return;
  }

  try {
    onSign.value = true;
    store.state.signature = sign;

    // устанавливаем ключ для подписи документов
    client.Document.setWif(store.state.account.private_key);

    // Подписываем все документы регистрации динамически
    await createUser.signAllRegistrationDocuments((msg) => {
      loadingText.value = msg;
    });

    loadingText.value = 'Подписываем заявление';
    await createUser.signStatement();

    // Отправка
    await createUser.sendStatementAndAgreements();

    loadingText.value = '';
    onSign.value = false;
    store.next();
  } catch (err: any) {
    onSign.value = false;
    FailAlert(err);
  }
};
</script>

<style scoped>
.signature-container {
  min-height: 300px;
  padding: 16px;
  border: 3px solid var(--q-primary);
  border-radius: 12px;
  box-shadow:
    0 0 8px var(--q-primary),
    0 0 16px var(--q-primary),
    inset 0 0 8px rgba(255, 255, 255, 0.1);
  background: transparent;
  position: relative;
  transition: all 0.3s ease;
}

.signature-container:hover {
  box-shadow:
    0 0 12px var(--q-primary),
    0 0 24px var(--q-primary),
    inset 0 0 12px rgba(255, 255, 255, 0.15);
}

.signature-hint {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  color: var(--q-primary);
  font-weight: 500;
  font-size: 14px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  z-index: 1;
  pointer-events: none;
}

.body--dark .signature-hint {
  background: rgba(0, 0, 0, 0.8);
  color: var(--q-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.signature-container.signature-started .signature-hint {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
  pointer-events: none;
  transition: all 0.5s ease-out;
}
</style>
