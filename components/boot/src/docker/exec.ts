import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export async function execCommand(command: string[]): Promise<void> {
  const fullCmd = ['docker', 'compose', 'exec', 'node', ...command].join(' ')

  try {
    // eslint-disable-next-line node/prefer-global/process
    const { stdout, stderr } = await execAsync(fullCmd, { env: process.env })
    if (stdout)
      console.log(stdout.trim())
    if (stderr)
      console.error(stderr.trim())
  }
  catch (err: any) {
    if (err.stdout)
      console.log(err.stdout.trim())
    if (err.stderr)
      console.error(err.stderr.trim())
    // опционально:
    // console.error(`Command failed with code ${err.code}`)
  }
}
