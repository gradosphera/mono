import type {
  EosioReaderAbisMap,
  EosioReaderActionFilter,
  EosioReaderConfig,
  EosioReaderTableRowFilter,
  ShipTableDeltaName,
} from '@blockmatic/eosio-ship-reader'

import {
  createEosioShipReader,
} from '@blockmatic/eosio-ship-reader'

import { eosioApi, finishBlock, shipApi, startBlock, subscribedContracts, subsribedActions } from '../config'
import type { Database } from '../Database'
import { extractTablesFromAbi, fetchAbi, getInfo } from '../Utils/Blockchain'

const actions_whitelist: () => EosioReaderActionFilter[] = () => subsribedActions
console.log('Actions whitelist (auto-generated from subscribedContracts):', subsribedActions)

export async function loadReader(db: Database): Promise<ReturnType<typeof createEosioShipReader>> {
  let currentBlock = await db.getCurrentBlock()

  const info = await getInfo()

  if (Number(startBlock) === 1) {
    if (currentBlock === 0) {
      currentBlock = Number(info.head_block_num)
    }
    // Если currentBlock !== 0, продолжаем парсинг с сохраненного блока из базы данных
  }
  else {
    currentBlock = Number(startBlock)
  }

  console.log('Стартуем с блока: ', currentBlock)
  console.log('Завершим на блоке: ', finishBlock)
  console.log('Высота цепочки: ', info.head_block_num)
  console.log('Очищаем действия и дельты после блока: ', currentBlock)

  await db.purgeAfterBlock(currentBlock)

  const unique_contract_names = [...new Set([...subscribedContracts, ...actions_whitelist().map(row => row.code)])]
  const abisArr = await Promise.all(unique_contract_names.map(account_name => fetchAbi(account_name)))

  const contract_abis: () => EosioReaderAbisMap = () => {
    const numap = new Map()
    abisArr.forEach(({ account_name, abi }) => numap.set(account_name, abi))
    return numap
  }

  // Формируем whitelist таблиц динамически из ABI контрактов
  const table_rows_whitelist: () => EosioReaderTableRowFilter[] = () => {
    const tables: EosioReaderTableRowFilter[] = []
    abisArr.forEach(({ account_name, abi }) => {
      if (subscribedContracts.includes(account_name)) {
        const tableNames = extractTablesFromAbi(abi)
        tableNames.forEach((tableName) => {
          tables.push({ code: account_name, table: tableName })
        })
      }
    })
    return tables
  }

  const tablesWhitelist = table_rows_whitelist()
  console.log('Tables whitelist (auto-generated from ABI):', tablesWhitelist)

  const delta_whitelist: () => ShipTableDeltaName[] = () => [
    'account_metadata',
    'contract_table',
    'contract_row',
    'contract_index64',
    'resource_usage',
    'resource_limits_state',
  ]

  const eosioReaderConfig: EosioReaderConfig = {
    ws_url: shipApi,
    rpc_url: eosioApi,
    ds_threads: 2,
    ds_experimental: false,
    delta_whitelist,
    table_rows_whitelist,
    actions_whitelist,
    contract_abis,
    request: {
      start_block_num: currentBlock,
      end_block_num: Number(finishBlock), // info.head_block_num,
      max_messages_in_flight: 50,
      have_positions: [],
      irreversible_only: true,
      fetch_block: true,
      fetch_traces: true,
      fetch_deltas: true,
    },
    auto_start: true,
  }

  return await createEosioShipReader(eosioReaderConfig)
}
