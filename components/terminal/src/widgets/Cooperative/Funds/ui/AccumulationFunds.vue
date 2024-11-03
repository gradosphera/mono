<script setup lang="ts">
import { computed, ref } from 'vue';
import { FundContract } from 'cooptypes';
import { useEditFund } from 'src/features/Cooperative/EditFund';
import { COOPNAME } from 'src/shared/config';
import { useSessionStore } from 'src/entities/Session';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useCooperativeStore } from 'src/entities/Cooperative';
import AddAccumulationFund from './AddAccumulationFund.vue'
import { useDeleteFund } from 'src/features/Cooperative/DeleteFund';

const coop = useCooperativeStore()

const loadFunds = async () => {
  try {
    await coop.loadFunds(COOPNAME)
  } catch(e: any){
    FailAlert(e.message)
  }
}

loadFunds()

const accumulationFunds = computed(() => coop.accumulationFunds)

const showAdd = ref(false)

const session = useSessionStore()

const totalAccumulationPercent = computed(() =>
  accumulationFunds.value.reduce((sum, item) => sum + Number(item.percent), 0)
);

const totalExpensePercent = computed(() => (100 - totalAccumulationPercent.value).toFixed(2))

const delFund = async(fund: FundContract.Tables.AccumulatedFunds.IAccumulatedFund) => {
  const { deleteFund } = useDeleteFund()
  try {
    await deleteFund({
      coopname: COOPNAME,
      username: session.username,
      type: 'accumulation',
      fund_id: fund.id
    })

    await coop.loadFunds(COOPNAME)
    SuccessAlert('Фонд успешно удалён')

  } catch (e: any){
    FailAlert(e.message)
  }
}

const saveFund = async (fund: FundContract.Tables.AccumulatedFunds.IAccumulatedFund) => {
    const percent = Number(fund.percent) * 10000

    const { editFund } = useEditFund()

    try {

      await editFund({
        coopname: COOPNAME,
        username: session.username,
        type: 'accumulation',
        fund_id: fund.id,
        contract: '',
        name: fund.name,
        description: fund.description,
        percent: percent
      })

      await coop.loadFunds(COOPNAME)

      SuccessAlert('Фонд успешно обновлён')
    } catch(e: any){
      FailAlert(e.message)
      await coop.loadFunds(COOPNAME)
    }

};

const getLabel = (id: any) => {
  if (id <= 3)
    return 'обязательный'
}

const columns = ref([
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'name', label: 'Название', field: 'name', align: 'left' },
  // { name: 'description', label: 'Заметка', field: 'description', align: 'left' },
  { name: 'percent', label: 'Процент', field: 'percent', align: 'left' }
] as any)

</script>

<template lang="pug">
div
  q-table(v-if="accumulationFunds" flat :rows-per-page-options="[0]" :rows="accumulationFunds" :columns="columns" row-key="id")
    template(#top)
      div.full-width
        p Все невозвратные членские взносы кооператива в первую очередь распределяются по фондам накопления в указанных соотношениях. Остаток после распределения заносится на накопительный счёт фондов списания. Первые три фонда являются обязательными.
      div.q-mt-lg.full-width
        q-btn(icon="add" @click="showAdd = true" color="primary" size="sm") добавить фонд
    template(v-slot:body="props")
      q-tr(:props="props" :key="props.row.id")
        q-td(:props="props" key="id") {{ props.row.id }}
        q-td(:props="props" key="name")
          q-input(v-model="props.row.name" :label="getLabel(props.row.id)" :readonly="props.row.id <= 3" standout="bg-teal text-white" dense)
        //- q-td(:props="props" key="description")
        //-   q-input( placeholder="Место для заметки" v-model="props.row.description" standout="bg-teal text-white" dense)
        q-td(:props="props" key="percent")
          q-input( v-model="props.row.percent" type="number" standout="bg-teal text-white" dense)

        q-td
          q-btn(@click="saveFund(props.row)" label="Обновить" color="primary" dense size="sm").q-ma-xs
          q-btn(@click="delFund(props.row)" :disabled="props.row.id <= 3" label="Удалить" color="primary" dense size="sm").q-ma-xs
    template(#bottom)
      p {{ totalAccumulationPercent }}% от каждого членского взноса распределяется среди фондов накопления, а {{ totalExpensePercent }}% направляется на накопительный кошелёк фондов списания.
  AddAccumulationFund(:showAdd="showAdd" @close="showAdd = false")

</template>
