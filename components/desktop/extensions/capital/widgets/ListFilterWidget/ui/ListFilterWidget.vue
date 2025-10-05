<template lang="pug">
q-card(flat)
  q-card-section

    // Фильтры в ряд
    .row.q-gutter-md.items-end
      // Фильтр по статусам задач
      .col
        q-select(
          ref='statusSelectRef',
          v-model='computedSelectedStatuses',
          :options='statusOptions',
          option-value='value',
          option-label='label',
          emit-value,
          map-options,
          multiple,
          use-chips,
          stack-label,
          label='Статусы задач',
          placeholder='Выберите статусы',
          filled,
          dense
        )
          template(#selected-item='scope')
            q-chip(
              :label='scope.opt.label',
              removable,
              dense,
              @remove='removeStatus(scope.opt.value)'
            )
          template(#after-options)
            .row.justify-end.q-pa-sm
              q-btn(
                flat,
                dense,
                round,
                icon='check',
                color='primary',
                @click='confirmStatusSelection'
              )

      // Фильтр по приоритетам задач
      .col
        q-select(
          ref='prioritySelectRef',
          v-model='computedSelectedPriorities',
          :options='priorityOptions',
          option-value='value',
          option-label='label',
          emit-value,
          map-options,
          multiple,
          use-chips,
          stack-label,
          label='Приоритеты задач',
          placeholder='Выберите приоритеты',
          filled,
          dense
        )
          template(#selected-item='scope')
            q-chip(
              :label='scope.opt.label',
              removable,
              dense,
              @remove='removePriority(scope.opt.value)'
            )
          template(#after-options)
            .row.justify-end.q-pa-sm
              q-btn(
                flat,
                dense,
                round,
                icon='check',
                color='primary',
                @click='confirmPrioritySelection'
              )

      // Фильтр по создателю задач
      .col

        ContributorSelector(
          v-model='selectedCreator',
          :project-hash='projectHash',
          :coopname='coopname',
          label='Создатель',
          placeholder='',
          dense,
          :readonly='isSelfCreator'
          :multiSelect='false'
        )
          template(#prepend)
            q-checkbox(
              v-model='isSelfCreator',
              label='я',
              color='primary',
              size='sm'
            )

      // Фильтр по мастеру
      .col
        ContributorSelector(
          v-model='selectedMaster',
          :project-hash='projectHash',
          :coopname='coopname',
          label='Мастер',
          placeholder='',
          dense,
          :readonly='isSelfSelected'
          :multiSelect='false'
        )
          template(#prepend)
            q-checkbox(
              v-model='isSelfSelected',
              label='я',
              color='primary',
              size='sm'
            )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { Zeus } from '@coopenomics/sdk';
import { ContributorSelector } from 'app/extensions/capital/entities/Contributor';
import type { IContributor } from 'app/extensions/capital/entities/Contributor/model/types';
import type { QSelect } from 'quasar';
import { getIssueStatusLabel } from '../../../shared/lib/issueStatus';
// Пропы
const props = defineProps<{
  initialStatuses?: string[];
  initialPriorities?: string[];
  initialCreators?: string[];
  initialIsMaster?: boolean;
  projectHash?: string;
  coopname?: string;
}>();

// Эмиты
const emit = defineEmits<{
  filtersChanged: [filters: {
    statuses: string[];
    priorities: string[];
    creators: string[];
    master?: string;
  }];
}>();

// Refs для селектов
const statusSelectRef = ref<QSelect>();
const prioritySelectRef = ref<QSelect>();

// Состояние фильтров
const selectedStatuses = ref<string[]>(props.initialStatuses || []);
const selectedPriorities = ref<string[]>(props.initialPriorities || []);
const selectedCreator = ref<IContributor | null>(null);
const isSelfCreator = ref(false);

// Computed свойства для правильного управления выбором
const computedSelectedStatuses = computed({
  get: () => selectedStatuses.value,
  set: (value: string[]) => {

    const previousValue = selectedStatuses.value;

    if (value.includes('') && !previousValue.includes('')) {
      // Пользователь выбрал "все", когда его не было - оставляем только "все"
      selectedStatuses.value = [''];
    } else if (value.includes('') && previousValue.includes('') && value.length > 1) {
      // Было "все", и добавили конкретный - убираем "все", оставляем конкретный
      selectedStatuses.value = value.filter(v => v !== '');
    } else if (!value.includes('') && value.length > 0) {
      // Выбраны только конкретные статусы
      selectedStatuses.value = value;
    } else if (value.length === 0) {
      // Ничего не выбрано в интерфейсе - добавляем "все"
      selectedStatuses.value = [''];
    } else {
      // Оставляем как есть (только "все")
      selectedStatuses.value = value;
    }

    applyFilters();
  }
});

const computedSelectedPriorities = computed({
  get: () => selectedPriorities.value,
  set: (value: string[]) => {

    const previousValue = selectedPriorities.value;

    if (value.includes('') && !previousValue.includes('')) {
      // Пользователь выбрал "все", когда его не было - оставляем только "все"
      selectedPriorities.value = [''];
    } else if (value.includes('') && previousValue.includes('') && value.length > 1) {
      // Было "все", и добавили конкретный - убираем "все", оставляем конкретный
      selectedPriorities.value = value.filter(v => v !== '');
    } else if (!value.includes('') && value.length > 0) {
      // Выбраны только конкретные приоритеты
      selectedPriorities.value = value;
    } else if (value.length === 0) {
      // Ничего не выбрано в интерфейсе - добавляем "все"
      selectedPriorities.value = [''];
    } else {
      // Оставляем как есть (только "все")
      selectedPriorities.value = value;
    }

    applyFilters();
  }
});
// Состояние для выбора мастера
const selectedMaster = ref<IContributor | null>(null);
const isSelfSelected = ref(props.initialIsMaster || false);

// Stores для получения текущего пользователя
const contributorStore = useContributorStore();

// Опции статусов задач
const statusOptions = computed(() => [
  { label: 'Все статусы', value: '' },
  { label: getIssueStatusLabel(Zeus.IssueStatus.BACKLOG), value: Zeus.IssueStatus.BACKLOG },
  { label: getIssueStatusLabel(Zeus.IssueStatus.TODO), value: Zeus.IssueStatus.TODO },
  { label: getIssueStatusLabel(Zeus.IssueStatus.IN_PROGRESS), value: Zeus.IssueStatus.IN_PROGRESS },
  { label: getIssueStatusLabel(Zeus.IssueStatus.ON_REVIEW), value: Zeus.IssueStatus.ON_REVIEW },
  { label: getIssueStatusLabel(Zeus.IssueStatus.DONE), value: Zeus.IssueStatus.DONE },
  { label: getIssueStatusLabel(Zeus.IssueStatus.CANCELED), value: Zeus.IssueStatus.CANCELED },
]);

// Опции приоритетов задач
const priorityOptions = [
  { label: 'Все приоритеты', value: '' },
  { label: 'Срочный', value: Zeus.IssuePriority.URGENT },
  { label: 'Высокий', value: Zeus.IssuePriority.HIGH },
  { label: 'Средний', value: Zeus.IssuePriority.MEDIUM },
  { label: 'Низкий', value: Zeus.IssuePriority.LOW },
];

// Вычисляемое свойство для мастер фильтра
const masterFilterValue = computed(() => {
  if (isSelfSelected.value) {
    return contributorStore.self?.username;
  }
  return selectedMaster.value?.username;
});

// Вычисляемое свойство для creator фильтра
const creatorFilterValue = computed(() => {
  if (isSelfCreator.value) {
    return contributorStore.self?.username ? [contributorStore.self.username] : [];
  }
  return selectedCreator.value?.username ? [selectedCreator.value.username] : [];
});

// Применение фильтров
const applyFilters = () => {
  emit('filtersChanged', {
    statuses: selectedStatuses.value.filter(s => s !== ''),
    priorities: selectedPriorities.value.filter(p => p !== ''),
    creators: creatorFilterValue.value,
    master: masterFilterValue.value,
  });
};


// Watcher для чекбокса "я" - автоматически выбирает/очищает себя
watch(isSelfSelected, (isSelf) => {
  if (isSelf) {
    // Если выбрано "я", автоматически устанавливаем текущего пользователя
    selectedMaster.value = contributorStore.self;
  } else {
    // Если сняли галочку "я", очищаем выбор если там был текущий пользователь
    if (selectedMaster.value?.username === contributorStore.self?.username) {
      selectedMaster.value = null;
    }
  }
  applyFilters();
});

// Watcher для изменения выбранного мастера
watch(selectedMaster, () => {
  // Если выбрали кого-то другого, снимаем галочку "я"
  if (selectedMaster.value && selectedMaster.value.username !== contributorStore.self?.username) {
    isSelfSelected.value = false;
  }
  applyFilters();
});

// Watcher для чекбокса "я" создателя - автоматически выбирает/очищает себя
watch(isSelfCreator, (isSelf) => {
  if (isSelf) {
    // Если выбрано "я", автоматически устанавливаем текущего пользователя
    selectedCreator.value = contributorStore.self;
  } else {
    // Если сняли галочку "я", очищаем выбор если там был текущий пользователь
    if (selectedCreator.value?.username === contributorStore.self?.username) {
      selectedCreator.value = null;
    }
  }
  applyFilters();
});

// Watcher для изменения выбранного создателя
watch(selectedCreator, () => {
  // Если выбрали кого-то другого, снимаем галочку "я"
  if (selectedCreator.value && selectedCreator.value.username !== contributorStore.self?.username) {
    isSelfCreator.value = false;
  }
  applyFilters();
});

// Удаление отдельных чипсов
const removeStatus = (statusValue: string) => {
  selectedStatuses.value = selectedStatuses.value.filter(s => s !== statusValue);
  applyFilters();
};

const removePriority = (priorityValue: string) => {
  selectedPriorities.value = selectedPriorities.value.filter(p => p !== priorityValue);
  applyFilters();
};

// Методы подтверждения выбора и закрытия меню
const confirmStatusSelection = () => {
  statusSelectRef.value?.hidePopup();
  applyFilters();
};

const confirmPrioritySelection = () => {
  prioritySelectRef.value?.hidePopup();
  applyFilters();
};

// Инициализация
onMounted(() => {
  // Если нет начальных значений - устанавливаем "все"
  if (selectedStatuses.value.length === 0) {
    selectedStatuses.value = [''];
  }
  if (selectedPriorities.value.length === 0) {
    selectedPriorities.value = [''];
  }

  // Инициализируем мастер фильтр
  if (props.initialIsMaster && contributorStore.self) {
    isSelfSelected.value = true;
    selectedMaster.value = contributorStore.self;
  }

  // Применяем начальные фильтры при монтировании
  applyFilters();
});
</script>

<style lang="scss" scoped>
.q-card-section {
  padding: 16px;
}

.text-h6 {
  font-weight: 500;
  margin-bottom: 16px;
}

.text-subtitle2 {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.q-option-group {
  .q-checkbox {
    margin-bottom: 8px;
  }
}
</style>
