/**
 * CLI-диспетчер seed-фаз CAPITAL.
 *
 *   pnpm --filter @coopenomics/boot exec esno src/scripts/seed-capital/index.ts <phase>
 *   ...                                                                       <phase> <phase> ...
 *   ...                                                                       --up-to=<phase>
 *   ...                                                                       all
 *
 * Каждая фаза идемпотентна. Список фаз прогоняется в указанном порядке.
 * `--up-to=X` прогоняет все фазы в каноническом порядке до X включительно —
 * это удобно когда нужно «довести систему до состояния перед X и оставить как есть»
 * (например, для ручного теста UI на конкретном этапе).
 *
 * Логи — в stderr (чтобы stdout остался чистым для будущих скриптов).
 */
import { phase01 } from './phases/01-programs'
import { phase02 } from './phases/02-extension-config'
import { phase03 } from './phases/03-projects'
import { phase04 } from './phases/04-contributor'
import { phase05 } from './phases/05-additional-contributors'
import { phase06 } from './phases/06-create-project-koshelek'
import { phase07 } from './phases/07-master-and-plan'
import { phase08 } from './phases/08-investments'

const PHASES: Record<string, () => Promise<void>> = {
  '01-programs': phase01,
  '02-extension-config': phase02,
  '03-projects': phase03,
  '04-contributor': phase04,
  '05-additional-contributors': phase05,
  '06-create-project-koshelek': phase06,
  '07-master-and-plan': phase07,
  '08-investments': phase08,
}

const PHASE_ORDER = Object.keys(PHASES)

function usage(): never {
  console.error('Usage: seed-capital <phase> [<phase> ...] | --up-to=<phase> | all')
  console.error(`Available phases: ${PHASE_ORDER.join(', ')}`)
  process.exit(2)
}

async function runPhases(names: string[]) {
  for (const name of names) {
    const fn = PHASES[name]
    if (!fn) {
      console.error(`Unknown phase: ${name}`)
      console.error(`Available: ${PHASE_ORDER.join(', ')}`)
      process.exit(2)
    }
    console.error(`\n=== seed-capital: ${name} ===`)
    await fn()
  }
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length === 0) usage()

  if (args.length === 1 && args[0] === 'all') {
    await runPhases(PHASE_ORDER)
    return
  }

  const upTo = args.find((a) => a.startsWith('--up-to='))
  if (upTo) {
    const target = upTo.slice('--up-to='.length)
    const idx = PHASE_ORDER.indexOf(target)
    if (idx < 0) {
      console.error(`Unknown phase in --up-to: ${target}`)
      console.error(`Available: ${PHASE_ORDER.join(', ')}`)
      process.exit(2)
    }
    await runPhases(PHASE_ORDER.slice(0, idx + 1))
    return
  }

  await runPhases(args)
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
