import type { Database } from '../../Database'
import type { EosioShipReaderResolved, IBlock } from '../../Types'

export async function BlockParser(db: Database, reader: EosioShipReaderResolved) {
  const { blocks$, errors$, close$ } = reader

  errors$.subscribe(async (error: any) => {
    console.log('\nОшибка десериализации: ', error)
  })

  close$.subscribe(async (error: any) => {
    console.error('\nОшибка соединения: ', error)
    console.log('Выключение через 10 секунд')
    setTimeout(() => process.exit(1), 10000)
  })

  blocks$.subscribe(async (block: IBlock) => {
    // console.log('new block: ', block)
    process.stdout.write('\r') // Возврат каретки в начало строки
    process.stdout.write(`Блок: ${block.block_num}`) // Ваш текст

    db.updateCurrentBlock(block.last_irreversible_block_num)
  })
}
