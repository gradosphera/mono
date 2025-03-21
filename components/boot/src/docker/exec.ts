import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export async function execCommand(command: string[]): Promise<string> {
  const fullCmd = ['docker', 'compose', 'exec', '-T', 'node', ...command].join(' ')

  try {
    // eslint-disable-next-line node/prefer-global/process
    const { stdout, stderr } = await execAsync(fullCmd, { env: process.env })
    if (stderr) {
      console.error(stderr)
    }
    return stdout.trim()
  }
  catch (error: any) {
    console.error('Command failed:', error.stderr || error)
    throw error
  }
}
