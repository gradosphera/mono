<template lang="pug">
CreateDialog(
  ref='dialogRef'
  :title='props.title'
  submit-text='Применить'
  dialog-style='max-width: 600px; width: 90vw;'
  @submit='handleSubmit'
  @dialog-closed='handleDialogClosed'
)
  template(#form-fields)
    .row.q-gutter-md
      // Фильтр по статусам задач
      .col-12
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
      .col-12
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

      // Фильтр по исполнителю задач
      .col-12
        ContributorSelector(
          v-model='selectedCreator',
          :project-hash='projectHash',
          :coopname='coopname',
          label='Исполнитель',
          placeholder='',
          dense,
          :multiSelect='false'
        )

      // Фильтр по мастеру
      .col-12
        ContributorSelector(
          v-model='selectedMaster',
          :project-hash='projectHash',
          :coopname='coopname',
          label='Мастер',
          placeholder='',
          dense,
          :multiSelect='false'
        )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { ContributorSelector } from 'app/extensions/capital/entities/Contributor';
import { CreateDialog } from 'src/shared/ui';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import type { IContributor } from 'app/extensions/capital/entities/Contributor/model/types';
import type { QSelect } from 'quasar';
import { getIssueStatusLabel } from '../../../shared/lib/issueStatus';

// Пропы
const props = withDefaults(defineProps<{
  projectHash?: string;
  coopname?: string;
  title?: string;
}>(), {
  title: 'Фильтры проектов'
});

// Используем store для фильтров
const projectStore = useProjectStore();

// Эмиты
const emit = defineEmits<{
  filtersApplied: [filters: {
    statuses: string[];
    priorities: string[];
    creators: string[];
    master?: string;
  }];
}>();

// Refs для селектов
const dialogRef = ref<InstanceType<typeof CreateDialog>>();
const statusSelectRef = ref<QSelect>();
const prioritySelectRef = ref<QSelect>();

// Состояние фильтров (инициализируем из store)
const selectedStatuses = ref<string[]>(projectStore.projectFilters.statuses);
const selectedPriorities = ref<string[]>(projectStore.projectFilters.priorities);
const selectedCreator = ref<IContributor | null>(null);
const selectedMaster = ref<IContributor | null>(null);

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
  }
});

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

// Вычисляемое свойство для creator фильтра
const creatorFilterValue = computed(() => {
  return selectedCreator.value?.username ? [selectedCreator.value.username] : [];
});

// Вычисляемое свойство для master фильтра
const masterFilterValue = computed(() => {
  return selectedMaster.value?.username;
});

// Методы управления диалогом
const openDialog = () => {
  dialogRef.value?.openDialog();
};

const closeDialog = () => {
  dialogRef.value?.clear();
};

// Обработчики
const handleSubmit = () => {
  const filters = {
    statuses: selectedStatuses.value.filter(s => s !== ''),
    priorities: selectedPriorities.value.filter(p => p !== ''),
    creators: creatorFilterValue.value,
    master: masterFilterValue.value,
  };

  emit('filtersApplied', filters);
  closeDialog();
};

const handleDialogClosed = () => {
  // Можно добавить логику сброса состояния при закрытии
};

// Удаление отдельных чипсов
const removeStatus = (statusValue: string) => {
  selectedStatuses.value = selectedStatuses.value.filter(s => s !== statusValue);
};

const removePriority = (priorityValue: string) => {
  selectedPriorities.value = selectedPriorities.value.filter(p => p !== priorityValue);
};

// Методы подтверждения выбора и закрытия меню
const confirmStatusSelection = () => {
  statusSelectRef.value?.hidePopup();
};

const confirmPrioritySelection = () => {
  prioritySelectRef.value?.hidePopup();
};

// Инициализация
onMounted(async () => {
  // Восстанавливаем состояние фильтров из store
  selectedStatuses.value = [...projectStore.projectFilters.statuses];
  selectedPriorities.value = [...projectStore.projectFilters.priorities];

  // Если нет значений - устанавливаем "все"
  if (selectedStatuses.value.length === 0) {
    selectedStatuses.value = [''];
  }
  if (selectedPriorities.value.length === 0) {
    selectedPriorities.value = [''];
  }

  // TODO: Восстановить selectedCreator и selectedMaster из store
  // Пока оставляем пустыми - пользователь сможет выбрать заново
});

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog,
  closeDialog,
});
</script>

<style lang="scss" scoped>
.q-card-section {
  padding: 16px;
}

.q-option-group {
  .q-checkbox {
    margin-bottom: 8px;
  }
}
</style>
