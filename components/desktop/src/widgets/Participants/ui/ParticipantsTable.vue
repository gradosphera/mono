<template lang="pug">
q-table.participants-table(
  flat,
  :grid='isMobile',
  :rows='accounts',
  :columns='columns',
  row-key='username',
  :pagination='pagination',
  virtual-scroll,
  :virtual-scroll-item-size='48',
  :rows-per-page-options='[10]',
  :loading='loading',
  :no-data-label='"У кооператива нет пайщиков"'
)
  template(#header='props')
    q-tr(:props='props')
      q-th(auto-width)
      q-th(v-for='col in props.cols', :key='col.name', :props='props') {{ col.label }}

  template(#body='props')
    q-tr(:key='`m_${props.row.username}`', :props='props')
      q-td(auto-width)
        ExpandToggleButton(
          :expanded='expanded.get(props.row.username)',
          @click='onToggleExpand(props.row.username)'
        )

      q-td(
        style='max-width: 150px; word-wrap: break-word; white-space: normal'
      ) {{ getName(props.row) }}
      q-td {{ props.row.username }}

      q-td {{ props.row.provider_account?.email || 'Не указан' }}

      q-td {{ formatDate(props.row.participant_account?.created_at) == '' ? 'отсутствует' : formatDate(props.row.participant_account?.created_at) }}

      q-td
        .participants-table__status
          BaseBadge(:variant='getAccountStatusBadge(props.row).variant') {{ getAccountStatusBadge(props.row).label }}
          BaseButton(
            v-if='isDeletable(props.row)',
            variant='danger',
            size='sm',
            icon-only,
            aria-label='Удалить пайщика',
            @click='askDelete(props.row)'
          )
            template(#icon-left)
              q-icon(name='delete_outline', size='18px')

    q-tr.q-virtual-scroll--with-prev.no-hover(
      no-hover,
      v-if='expanded.get(props.row.username)',
      :key='`e_${props.row.username}`',
      :props='props'
    )
      q-td.no-hover(colspan='100%' style="padding: 0px !important;")
        ParticipantDetails(
          :participant='props.row',
          @update='(newData) => onUpdate(props.row, newData)'
        )

  template(#item='props')
    ParticipantCard(
      :participant='props.row',
      :expanded='expanded.get(props.row.username)',
      @toggle-expand='() => onToggleExpand(props.row.username)',
      @update='onUpdate',
      :deletable='isDeletable(props.row)',
      @delete='askDelete'
    )

BaseDialog(
  :model-value='confirmOpen',
  title='Удаление пайщика',
  size='sm',
  @update:model-value='(v) => (confirmOpen = v)'
)
  p.t-sm(style='margin: 0')
    | Удалить аккаунт пайщика «{{ deleteTarget ? getName(deleteTarget) : '' }}» из реестра?
    br
    | Действие необратимо. E-mail освободится для повторной регистрации.
  BaseBanner.q-mt-md(v-if='isOnChainRegistered(deleteTarget)', variant='warn')
    | Аккаунт уже зарегистрирован в блокчейне (после оплаты взноса). Запись в цепи удалить нельзя — имя «{{ deleteTarget?.username }}» останется занятым навсегда, из реестра провайдера он лишь исчезает.
  template(#footer)
    BaseButton(variant='ghost', :disabled='deleting', @click='confirmOpen = false') Отменить
    BaseButton(variant='danger', :loading='deleting', @click='confirmDelete') Удалить
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useWindowSize } from 'src/shared/hooks';
import moment from 'src/shared/lib/utils/dates/moment';
import { ParticipantCard, ParticipantDetails } from '.';
import { getName } from 'src/shared/lib/utils';
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton';
import { useAccountStore } from 'src/entities/Account/model';
import { getAccountStatusBadge } from 'src/entities/Account';
import { SuccessAlert, FailAlert } from 'src/shared/api';
import { Zeus } from '@coopenomics/sdk';
import {
  type IAccount,
  type IIndividualData,
  type IOrganizationData,
  type IEntrepreneurData,
} from 'src/entities/Account/types';

// Удаляем любой аккаунт, который ещё НЕ стал принятым пайщиком. participant_account
// (accepted|blocked) появляется только после приёма советом — его наличие ⟺ член
// кооператива, такого не трогаем. Всё прочее (черновик, заявление, оплачен/на
// рассмотрении совета, отклонён, возврат) — удаляемо. Зеркалит серверный guard в
// account.interactor.deleteAccount. Статус для гейта НЕ годится: воронка реально
// доходит лишь до Registered (отказ совета/возврат оставляют Registered, а
// Payed/Failed/Refunded users.status никем не выставляются).
const isDeletable = (account: IAccount): boolean => !account.participant_account;

// On-chain аккаунт заводится при оплате взноса (статус Registered) и в EOSIO
// неудаляем — предупреждаем председателя, что запись в цепи останется.
const isOnChainRegistered = (account: IAccount | null): boolean =>
  account?.provider_account?.status === Zeus.UserStatus.Registered;

// Props
defineProps<{
  accounts: IAccount[];
  loading: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: 'toggle-expand', id: string): void;
  (
    e: 'update',
    account: IAccount,
    newData: IIndividualData | IOrganizationData | IEntrepreneurData,
  ): void;
}>();

// Локальное состояние
const expanded = reactive(new Map<string, boolean>());
const pagination = ref({ rowsPerPage: 10 });
const { isMobile } = useWindowSize();

// Удаление пайщика
const accountStore = useAccountStore();
const confirmOpen = ref(false);
const deleting = ref(false);
const deleteTarget = ref<IAccount | null>(null);

const askDelete = (account: IAccount) => {
  deleteTarget.value = account;
  confirmOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  try {
    deleting.value = true;
    await accountStore.deleteAccount(deleteTarget.value.username);
    SuccessAlert('Пайщик удалён из реестра');
    confirmOpen.value = false;
    deleteTarget.value = null;
  } catch (e: any) {
    FailAlert(e);
  } finally {
    deleting.value = false;
  }
};

// Колонки таблицы
const columns: any[] = [
  {
    name: 'name',
    align: 'left',
    label: 'ФИО / Наименование',
    field: 'name',
    sortable: true,
  },
  {
    name: 'username',
    align: 'left',
    label: 'Аккаунт',
    field: 'username',
    sortable: true,
  },
  {
    name: 'email',
    align: 'left',
    label: 'Email',
    field: 'email',
    sortable: true,
  },
  {
    name: 'created_at',
    align: 'left',
    label: 'Дата вступления',
    field: 'created_at',
    sortable: true,
  },
  {
    name: 'status',
    align: 'left',
    label: 'Статус',
    field: 'status',
    sortable: true,
  },
];

// Форматирование даты
const formatDate = (date?: string) =>
  date ? moment(date).format('DD.MM.YY HH:mm:ss') : '';

// События
const onToggleExpand = (id: string) => {
  expanded.set(id, !expanded.get(id));
  emit('toggle-expand', id);
};

const onUpdate = (
  account: IAccount,
  newData: IIndividualData | IOrganizationData | IEntrepreneurData,
) => {
  emit('update', account, newData);
};
</script>

<style>
.participants-table__status {
  display: flex;
  align-items: center;
  gap: var(--p-2, 8px);
}

/* Грид-режим (мобайл): карточки во всю ширину с вертикальным отступом.
   Зазор задаём ЧЕРЕЗ padding grid-item'а (он входит в измеряемую высоту
   элемента virtual-scroll); margin-bottom virtual-scroll игнорирует. */
.participants-table .q-table__grid-item {
  width: 100%;
  padding: var(--p-2, 8px) 0;
}

.no-hover.q-tr--hover,
.no-hover.q-table__tr--hover,
.no-hover:hover,
.no-hover:focus {
  background: transparent !important;
  box-shadow: none !important;
  cursor: default !important;
}
</style>
