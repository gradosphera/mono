// Каталог `ai/` внутри пакета blago-cli (шаблоны BMAD для pull). Ищем по package.json, не по helpers.md.

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const BLAGO_CLI_PKG_NAME = '@coopenomics/blago-cli'

/** Маркер полного шаблона BMAD в пакете (есть при типичной установке). */
const BMAD_TEMPLATE_MARKER = path.join('bmad', '_bmad', '_config', 'bmad-help.csv')

function resolveBlagoCliPackageRoot(startDir: string): string {
  let dir = startDir
  for (let i = 0; i < 14; i += 1) {
    const pkgPath = path.join(dir, 'package.json')
    try {
      const raw = fs.readFileSync(pkgPath, 'utf8')
      const j = JSON.parse(raw) as { name?: string }
      if (j.name === BLAGO_CLI_PKG_NAME) {
        return dir
      }
    }
    catch {
      /* нет или не JSON */
    }
    const parent = path.dirname(dir)
    if (parent === dir) {
      break
    }
    dir = parent
  }
  throw new Error(
    `Не найден корень пакета ${BLAGO_CLI_PKG_NAME} (package.json) относительно исполняемого кода.`,
  )
}

export function bundledAiDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const root = resolveBlagoCliPackageRoot(here)
  const aiDir = path.join(root, 'ai')
  let st: fs.Stats
  try {
    st = fs.statSync(aiDir)
  }
  catch {
    throw new Error(`У пакета ${BLAGO_CLI_PKG_NAME} отсутствует каталог ai/ (${aiDir}).`)
  }
  if (!st.isDirectory()) {
    throw new Error(`Путь ai/ не является каталогом: ${aiDir}`)
  }
  const bmadMarker = path.join(aiDir, BMAD_TEMPLATE_MARKER)
  try {
    fs.accessSync(bmadMarker, fs.constants.R_OK)
    return aiDir
  }
  catch {
    /* legacy */
  }
  const legacyHelpers = path.join(aiDir, 'config', 'helpers.md')
  try {
    fs.accessSync(legacyHelpers, fs.constants.R_OK)
    return aiDir
  }
  catch {
    throw new Error(
      `В ${aiDir} нет ни ${BMAD_TEMPLATE_MARKER}, ни config/helpers.md — нужен шаблон BMAD или legacy ai/config.`,
    )
  }
}
