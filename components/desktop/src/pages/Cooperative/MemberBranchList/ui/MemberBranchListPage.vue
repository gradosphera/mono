<template lang="pug">
div
  div(style="max-width: 500px;").q-pa-md
    p Создание кооперативных участков на текущий момент происходит за пределами цифровой системы. В этом разделе добавляются уже созданные и юридически-оформленные кооперативные участки с их председателями.

    p При добавлении 3-х кооперативных участков кооператив автоматически перейдет на мажоритарную систему управления общего собрания уполномоченных председателей кооперативных участков. С момента перехода всем действующим будет предложено выбрать один из существующих участков и делегировать свой голос его председателю. Новые пайщики выбирают кооперативный участок при регистрации.

  q-table(
    v-if="branches"
    flat
    :rows="branches"
    :columns="columns"
    row-key="braname"
    :pagination="pagination"
    virtual-scroll
    :virtual-scroll-item-size="48"
    :loading="onLoading"
  ).full-width
    template(#top)
      CreateBranchButton

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
              EditableIndividualCard(:participantData="props.row.trustee" :readonly="true").q-mt-sm
              div.text-wrap
                p.text-grey для замены председателя участка - измените его имя аккаунта в карточке участка на аккаунт одного из пайщиков.
              div.q-mt-md.flex.justify-center
                DeleteBranchButton(:branch="props.row")
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useBranchStore } from 'src/entities/Branch/model';
import { useEditableTableRows } from 'src/shared/lib/composables/useEditableTableRows';
import { CreateBranchButton } from 'src/features/Branch/CreateBranch';
import { DeleteBranchButton } from 'src/features/Branch/DeleteBranch';
import { getNameFromUserData } from 'src/shared/lib/utils/getNameFromUserData';
import { BranchCard } from 'src/widgets/BranchCard';
import { EditableIndividualCard } from 'src/shared/ui/EditableIndividualCard';
import { BankDetailsCard } from 'src/widgets/BankDetailsCard';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()


const branchStore = useBranchStore();

branchStore.loadBranches({
  coopname: info.coopname
})

const onLoading = ref(false);

const branches = computed(() => branchStore.branches)

const columns = [
  { name: 'short_name', label: 'Название', align: 'left', field: 'short_name', sortable: true },
  { name: 'trustee', label: 'Председатель', align: 'left', field: 'trustee', sortable: true },
] as any;

const rowKey = 'braname';

const {
  expanded,
  toggleExpand
} = useEditableTableRows({
  rows: branches, // Передаем ref в композабл
  rowKey,
});


const pagination = ref({ rowsPerPage: 0 });
</script>
