<template lang="pug">
div branches

  CreateBranchButton

  q-table(
    v-if="branches && branches.length > 0"
    flat
    :rows="branches"
    :columns="columns"
    row-key="braname"
    :pagination="pagination"
    virtual-scroll
    :virtual-scroll-item-size="48"
    :loading="onLoading"
  ).full-width

    template(#header="props")
      q-tr(:props="props")
        q-th(auto-width)
        q-th(v-for="col in props.cols" :key="col.name" :props="props") {{ col.label }}

    template(#body="props")
      q-tr(:key="`m_${props.row.braname}`" :props="props")
        q-td(auto-width)
          q-btn(
            size="sm"
            color="primary"
            dense
            :icon="expanded.get(props.row.braname) ? 'remove' : 'add'"
            round
            @click="toggleExpand(props.row.braname)"
          )
        q-td {{ props.row.short_name }}
        q-td {{ getNameFromUserData(props.row.trustee) }}
      q-tr(
        v-if="expanded.get(props.row.braname)"
        :key="`e_${props.row.braname}`"
        :props="props"
        class="q-virtual-scroll--with-prev"
      )
        q-td(colspan="100%")
          div.row
            div.col-md-4.col-xs-12.q-pa-sm
              p.text-center.text-overline карточка участка
              BranchCard(:branch="props.row")
            div.col-md-4.col-xs-12.q-pa-sm
              p.text-center.text-overline карточка счёта
              BankDetailsCard(:bankDetails="props.row.bank_account")
            div.col-md-4.col-xs-12.q-pa-sm
              p.text-center.text-overline карточка председателя
              //- q-input(
              //-   dense
              //-   v-model="props.row.trustee.username"
              //-   standout="bg-teal text-white"
              //-   label="Имя аккаунта председателя"
              //-   hint="для замены председателя участка - замените имя аккаунта на новое"
              //- )
              IndividualCard(:individual="props.row.trustee" :readonly="true").q-mt-sm
              div.text-wrap.q-mt-sm
                p.text-grey для замены председателя участка - измените его имя аккаунта в карточке участка на аккаунт одного из пайщиков.

          div.q-pa-md
            q-btn(
              color="primary"
              label="СОХРАНИТЬ"
              :disabled="!isEdited.get(props.row.braname)"
              @click="saveChanges(props.row.braname)"
            )
            q-btn(
              color="negative"
              label="ОТМЕНИТЬ"
              flat
              :disabled="!isEdited.get(props.row.braname)"
              @click="discardChanges(props.row.braname)"
            )

</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { type IBranch, useBranchStore } from 'src/entities/Branch/model';
import { useEditableTableRows } from 'src/shared/lib/composables/useEditableTableRows';
import { COOPNAME } from 'src/shared/config';
import { CreateBranchButton } from 'src/features/Cooperative/CreateBranch';
import { getNameFromUserData } from 'src/shared/lib/utils/getNameFromUserData';
import { BranchCard } from 'src/widgets/BranchCard';
import { IndividualCard } from 'src/widgets/IndividualCard';
import { BankDetailsCard } from 'src/widgets/BankDetailsCard';
import { type IBankTransferData, useAddPaymentMethod } from 'src/features/Wallet/AddPaymentMethod/model';

const branchStore = useBranchStore();

const branches = ref<any[]>([]); // Создаем реактивный массив branches
const onLoading = ref(true);

branchStore.loadBranches({ coopname: COOPNAME }).then(() => {
  branches.value = branchStore.branches; // Заполняем branches после загрузки
  onLoading.value = false;
});
const columns = [
  { name: 'short_name', label: 'Название', align: 'left', field: 'short_name', sortable: true },
  { name: 'trustee', label: 'Председатель', align: 'left', field: 'trustee', sortable: true },
] as any;

const rowKey = 'braname';

const {
  expanded,
  isEdited,
  toggleExpand,
  resetRow,
  updateOriginalRow,
} = useEditableTableRows({
  rows: branches, // Передаем ref в композабл
  rowKey,
});

const {addPaymentMethod} = useAddPaymentMethod()


const saveChanges = async (id: string) => {
  const updatedRow = branches.value.find((row) => row[rowKey] === id) as IBranch;
  console.log('on save changes')
  if (updatedRow) {

    try {
      // Ваша логика сохранения данных, например, вызов API
      // await branchStore.saveBranch(updatedRow);
      await addPaymentMethod({
        username: updatedRow.braname,
        method_id: '1',
        method_type: 'bank_transfer',
        data: updatedRow.bank_account as IBankTransferData
      })

      updateOriginalRow(id);
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
    }
  }
};

const discardChanges = (id: string) => {
  resetRow(id);
};

const pagination = ref({ rowsPerPage: 0 });
</script>
