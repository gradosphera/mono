#!/usr/bin/env node
// Точка входа бинарника → runCli.

import { runCli } from './cmd/run-cli.js'

async function main(): Promise<void> {
  await runCli(process.argv)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
