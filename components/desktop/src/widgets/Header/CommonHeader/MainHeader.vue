<!-- MainHeader.vue -->
<template lang="pug">
q-header.header(bordered, :class='headerClass')
  q-toolbar
    q-btn(
      v-if='loggedIn',
      stretch,
      icon='menu',
      flat,
      @click='emitToggleLeftDrawer'
    )
    // Инжектированные кнопки действий в группе с прокруткой
    .header-actions-container
      q-btn(
        v-if='showLeftArrow',
        @click='scrollLeft',
        flat,
        round,
        dense,
        icon='chevron_left',
        size='sm',
        :class='isDark ? "header-scroll-arrow--dark" : "header-scroll-arrow--light"'
      ).header-scroll-arrow.left

      q-btn-group.header-actions-group(stretch flat ref='actionsGroupRef', :key='actionsKey')
        BackButton(v-if='loggedIn', :style='{ "height": "var(--header-action-height)", "animation-delay": "0ms" }')

        component(
          stretch
          v-for='(action, index) in headerActions',
          :key='action.id',
          :is='action.component',
          v-bind='action.props',
          :style='{ "height": "var(--header-action-height)", "animation-delay": `${(index + 1) * 80}ms` }'
        ).header-action-item


      q-btn(
        v-if='showRightArrow',
        @click='scrollRight',
        flat,
        round,
        dense,
        icon='chevron_right',
        size='sm',
        :class='isDark ? "header-scroll-arrow--dark" : "header-scroll-arrow--light"'
      ).header-scroll-arrow.right

    q-toolbar-title
      q-btn(
        v-if='!loggedIn && coopTitle',
        stretch,
        flat,
        @click='emitToggleLeftDrawer',
        :size='isMobile ? "md" : "lg"'
      ) {{ coopTitle }}

    // Добавляем компонент уведомлений, если пользователь авторизован
    NotificationCenter(v-if='loggedIn && isClient')

    // Компонент переключения темы без текста
    ToogleDarkLight(:isMobile='isMobile', :showText='false', :asButton='true')

    template(v-if='!loggedIn')
      q-btn(
        v-if='showRegisterButton && !is("signup") && !is("install")',
        color='primary',
        stretch,
        :size='isMobile ? "sm" : "lg"',
        @click='signup'
      )
        span.q-pr-sm регистрация
        i.fa-solid.fa-right-to-bracket

      q-btn(
        v-if='showRegisterButton && is("signup")',
        color='primary',
        stretch,
        :size='isMobile ? "sm" : "lg"',
        @click='login'
      )
        span.q-pr-sm вход
        i.fa-solid.fa-right-to-bracket
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUpdated, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSessionStore } from 'src/entities/Session';
import config from 'src/app/config';
import { useWindowSize, useHeaderActionsReader } from 'src/shared/hooks';
import { ToogleDarkLight } from 'src/shared/ui/ToogleDarkLight';
import { BackButton } from 'src/widgets/Header/BackButton';
import { NotificationCenter } from 'src/widgets/NotificationCenter';
import './HeaderStyles.scss';
import { useSystemStore } from 'src/entities/System/model';
import { Zeus } from '@coopenomics/sdk';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const systemStore = useSystemStore();
const session = useSessionStore();
const { isMobile } = useWindowSize();
const { headerActions } = useHeaderActionsReader();
const emit = defineEmits(['toggle-left-drawer']);

// Refs для управления прокруткой
const actionsGroupRef = ref<any>();
const showLeftArrow = ref(false);
const showRightArrow = ref(false);

// Получаем информацию для навигации назад
// const coopTitle = computed(() => env.COOP_SHORT_NAME)
const coopTitle = computed(() => {
  if (systemStore.info.system_status === Zeus.SystemStatus.install || systemStore.info.system_status === Zeus.SystemStatus.initialized) {
    return 'УСТАНОВКА';
  }
  return `${systemStore.info.vars?.short_abbr} ${systemStore.info.vars?.name}`;
});

const isClient = computed(() => process.env.CLIENT);

const isDark = computed(() => $q.dark.isActive);
const headerClass = computed(() =>
  isDark.value ? 'text-white bg-dark' : 'text-black bg-light',
);

const loggedIn = computed(() => {
  return session.isRegistrationComplete && session.isAuth;
});

const showRegisterButton = computed(() => {
  if (!loggedIn.value) {
    return config.registrator.showRegisterButton;
  }
  return false;
});

// Функции для управления прокруткой
const checkOverflow = () => {
  // Используем двойной nextTick для гарантии после анимаций
  nextTick(() => {
    nextTick(() => {
      if (!actionsGroupRef.value || !actionsGroupRef.value.$el) {
        showLeftArrow.value = false;
        showRightArrow.value = false;
        return;
      }

      const element = actionsGroupRef.value.$el;

      // Проверяем что элемент отрендерился (имеет размеры)
      if (element.clientWidth === 0) {
        showLeftArrow.value = false;
        showRightArrow.value = false;
        return;
      }

      // Проверяем реальные размеры с учетом погрешности
      const scrollWidth = Math.ceil(element.scrollWidth);
      const clientWidth = Math.floor(element.clientWidth);
      const scrollLeft = Math.round(element.scrollLeft);

      // Overflow есть только если разница больше 5 пикселей (увеличили допуск)
      const hasOverflow = scrollWidth > clientWidth + 5;
      const canScrollLeft = scrollLeft > 2;
      const canScrollRight = scrollLeft + clientWidth < scrollWidth - 2;

      showLeftArrow.value = hasOverflow && canScrollLeft;
      showRightArrow.value = hasOverflow && canScrollRight;
    });
  });
};

const scrollLeft = () => {
  if (!actionsGroupRef.value || !actionsGroupRef.value.$el) return;
  actionsGroupRef.value.$el.scrollBy({ left: -100, behavior: 'smooth' });
  setTimeout(checkOverflow, 400);
};

const scrollRight = () => {
  if (!actionsGroupRef.value || !actionsGroupRef.value.$el) return;
  actionsGroupRef.value.$el.scrollBy({ left: 100, behavior: 'smooth' });
  setTimeout(checkOverflow, 400);
};

const is = (what: string) => route.name === what;

const signup = () => {
  router.push({ name: 'signup', params: { coopname: systemStore.info.coopname } });
};

const login = () => {
  router.push({ name: 'signin', params: { coopname: systemStore.info.coopname } });
};

const emitToggleLeftDrawer = () => {
  emit('toggle-left-drawer');
};

// Lifecycle hooks и watchers
onMounted(() => {
  // Задержка для завершения первичного рендера
  setTimeout(() => {
    checkOverflow();

    // Слушаем изменения размера окна
    window.addEventListener('resize', checkOverflow);

    // Подключаем слушатель скролла
    attachScrollListener();
  }, 100);
});

onUpdated(() => {
  // Немедленная проверка после обновления
  nextTick(() => {
    checkOverflow();
  });
  // И еще одна после завершения анимаций
  setTimeout(() => {
    checkOverflow();
    // Переподключаем слушатель после обновления (из-за :key)
    attachScrollListener();
  }, 450);
});

// Функция для подключения слушателя скролла
const attachScrollListener = () => {
  if (actionsGroupRef.value && actionsGroupRef.value.$el) {
    // Убираем старый слушатель если был
    actionsGroupRef.value.$el.removeEventListener('scroll', checkOverflow);
    // Добавляем новый
    actionsGroupRef.value.$el.addEventListener('scroll', checkOverflow);
  }
};

// Ключ для перерендера группы при смене действий
const actionsKey = computed(() => {
  return headerActions.value.map((action) => action.id).join('-');
});

// Watch за изменениями в headerActions для обновления стрелочек
watch(headerActions, (newActions, oldActions) => {
  // Если кнопок стало меньше - проверяем с минимальной задержкой
  if (newActions.length < oldActions.length) {
    // Немедленная проверка
    nextTick(() => {
      checkOverflow();
      attachScrollListener();
    });
    // И дополнительная проверка через 50ms для надежности
    setTimeout(() => {
      checkOverflow();
    }, 50);
  } else {
    // Если кнопок стало больше или столько же - ждем окончания анимации
    setTimeout(() => {
      checkOverflow();
      attachScrollListener();
    }, 450);
  }
}, { deep: true });
</script>
<style>
.header-action-item {
  margin-right: 3px;
}
</style>
