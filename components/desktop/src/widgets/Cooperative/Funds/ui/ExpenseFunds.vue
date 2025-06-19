<script setup lang="ts">
import { computed, ref } from 'vue';
import { FundContract } from 'cooptypes';
import { useEditFund } from 'src/features/Fund/EditFund';
import { useSessionStore } from 'src/entities/Session';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useCooperativeStore } from 'src/entities/Cooperative';
import AddExpenseFund from './AddExpenseFund.vue'
import { useDeleteFund } from 'src/features/Fund/DeleteFund';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

const coop = useCooperativeStore()

const loadFunds = async () => {
  try {
    await coop.loadFunds(info.coopname)
  } catch(e: any){
    FailAlert(e)
  }
}

loadFunds()

const expenseFunds = computed(() => coop.expenseFunds)

const showAdd = ref(false)

const session = useSessionStore()

const delFund = async(fund: FundContract.Tables.AccumulatedFunds.IAccumulatedFund) => {
  const { deleteFund } = useDeleteFund()
  try {
    await deleteFund({
      coopname: info.coopname,
      username: session.username,
      type: 'expend',
      fund_id: fund.id
    })

    await coop.loadFunds(info.coopname)
    SuccessAlert('Фонд успешно удалён')

  } catch (e: any){
    FailAlert(e)
  }
}

const saveFund = async (fund: FundContract.Tables.AccumulatedFunds.IAccumulatedFund) => {

    const { editFund } = useEditFund()

    try {

      await editFund({
        coopname: info.coopname,
        username: session.username,
        type: 'expend',
        fund_id: fund.id,
        contract: '',
        name: fund.name,
        description: fund.description,
        percent: 0
      })

      await coop.loadFunds(info.coopname)

      SuccessAlert('Фонд успешно обновлён')
    } catch(e: any){
      FailAlert(e)
      await coop.loadFunds(info.coopname)
    }

};

const columns = ref([
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'name', label: 'Название', field: 'name', align: 'left' },
  // { name: 'description', label: 'Заметка', field: 'description', align: 'left' }
] as any)

const getLabel = (id: any) => {
  if (id <= 5)
    return 'обязательный'
}

</script>

<template lang="pug">
div
  q-table(v-if="expenseFunds" flat :rows-per-page-options="[0]" :rows="expenseFunds" :columns="columns" row-key="id")
    template(#top)
      div.full-width
        p Фонды списания используются для фиксации расходов кооператива с накопительного счёта невозвратных членских взносов кооператива, которые остались после распределения по фондам накопления. Первые два фонда являются обязательными.
      div.q-mt-lg.full-width
        q-btn(icon="add" @click="showAdd = true" color="primary" size="sm") добавить фонд

    template(v-slot:body="props")
      q-tr(:props="props" :key="props.row.id")

        q-td(:props="props" key="id") {{ props.row.id }}
        q-td(:props="props" key="name")
          q-input(v-model="props.row.name" :label="getLabel(props.row.id)" :readonly="props.row.id <= 5" standout="bg-teal text-white" dense)

        //- q-td(:props="props" key="description")
        //-   q-input( placeholder="Место для заметки" v-model="props.row.description" standout="bg-teal text-white" dense)

        q-td
          q-btn(@click="saveFund(props.row)" label="Обновить" color="primary" size="sm" dense).q-ma-xs
          q-btn(@click="delFund(props.row)"  label="Удалить" color="primary" size="sm" dense).q-ma-xs

  AddExpenseFund(:showAdd="showAdd" @close="showAdd = false")

</template>
