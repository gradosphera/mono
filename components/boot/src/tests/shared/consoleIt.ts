interface ActionTrace {
  act?: {
    account: string
    name: string
    authorization?: { actor: string }[]
  }
  console?: string
  inline_traces?: ActionTrace[]
}

interface TransactionResult {
  processed?: {
    action_traces?: ActionTrace[]
  }
}

/**
 * Извлекает и печатает все консоль логи из результата транзакции
 * @param transaction - результат транзакции blockchain.api.transact
 */
export function consoleIt(transaction: TransactionResult): void {
  if (!transaction?.processed?.action_traces) {
    console.log('❌ Нет данных о транзакции или action traces')
    return
  }

  console.log('\n📋 КОНСОЛЬ ЛОГИ ТРАНЗАКЦИИ:')
  console.log('='.repeat(50))

  let hasConsoleLogs = false

  function processActionTrace(trace: ActionTrace, depth = 0): void {
    const indent = '  '.repeat(depth)

    // Получаем информацию о действии
    const account = trace.act?.account || 'unknown'
    const action = trace.act?.name || 'unknown'
    const actor = trace.act?.authorization?.[0]?.actor || 'unknown'

    // Печатаем заголовок действия
    console.log(`${indent}🔧 ${account}:${action} (actor: ${actor})`)

    // Если есть консоль логи, печатаем их
    if (trace.console) {
      hasConsoleLogs = true
      const logs = trace.console.split('\n').filter(log => log.trim())

      if (logs.length > 0) {
        console.log(`${indent}📝 Console output:`)
        logs.forEach((log) => {
          console.log(`${indent}   ${log}`)
        })
      }
    }
    else {
      console.log(`${indent}   (нет консоль логов)`)
    }

    // Обрабатываем inline traces рекурсивно
    if (trace.inline_traces?.length) {
      console.log(`${indent}   ↳ Inline actions:`)
      trace.inline_traces.forEach((inlineTrace) => {
        processActionTrace(inlineTrace, depth + 1)
      })
    }

    if (depth === 0) {
      console.log('') // Пустая строка между действиями верхнего уровня
    }
  }

  // Обрабатываем все action traces
  transaction.processed.action_traces.forEach((trace, index) => {
    console.log(`\n📍 Action ${index + 1}:`)
    processActionTrace(trace, 0)
  })

  if (!hasConsoleLogs) {
    console.log('ℹ️  В транзакции не найдено консоль логов')
  }

  console.log('='.repeat(50))
  console.log('🏁 Конец логов транзакции\n')
}
