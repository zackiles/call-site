#!/usr/bin/env -S deno run --allow-all
import { getConfig } from './config.ts'
import { join } from '@std/path'
const config = await getConfig()
/**
 * Map of commands to their corresponding script file names
 * Commands handled locally (like "help") are not included
 */
const COMMAND_MAP: Record<string, string> = {
  'generate': 'generate.ts',
  'reset': 'reset.ts',
  'update': 'update.ts',
  'start': 'host-server.ts',
  'cli': 'host-cli.ts',
}

/**
 * Run a command as a separate process using Deno.command
 * This function executes the specified script with the same permissions as the parent process
 * @param scriptName The name of the script to run (without .ts extension)
 * @returns Promise that resolves when the process completes
 */
async function runCommand(scriptName: string): Promise<void> {
  // Get the current executable and flags
  const denoExecutable = Deno.execPath()

  // Get the full path to the script using config.kitDir
  const scriptPath = join(config.kitDir, scriptName)

  // Create the command with the same permissions
  const command = new Deno.Command(denoExecutable, {
    args: [
      'run',
      '--allow-all',
      scriptPath,
      ...Deno.args.slice(1),
    ],
    stdout: 'inherit',
    stderr: 'inherit',
  })

  // Spawn the process (instead of using output() which waits for completion)
  const process = command.spawn()

  // Wait for the process to complete and get its status
  const status = await process.status

  // If the command failed, exit with the same code
  if (status.code !== 0) {
    // Instead of throwing an error, exit with the same code
    // This propagates the exit code up to the parent process
    Deno.exit(status.code)
  }
}

/**
 * Display help message showing available commands
 */
function displayHelp(): void {
  console.log('Deno Kit - Usage:')
  console.log(
    '  deno run --allow-read --allow-write --allow-run --allow-env --allow-net template.ts [command]',
  )
  console.log('\nCommands:')
  console.log('  generate    Generate project files from templates (default)')
  console.log('  reset       Restore files from backups')
  console.log('  update      Update the Cursor configuration from GitHub')
  console.log('  help        Display this help message')
  console.log('  start       Start the development server')
  console.log('  cli         Start the CLI interface')
  console.log(
    '\nIf no command is provided, the "help" command will be executed.',
  )
}

/**
 * Main function that dispatches to the appropriate command handler
 */
async function main(): Promise<void> {
  // Get the command from arguments
  const command = Deno.args[0]?.toLowerCase() || 'help'

  // Handle local commands first
  if (command === 'help') {
    displayHelp()
    return
  }

  // Check if the command exists in our map
  if (command in COMMAND_MAP) {
    await runCommand(COMMAND_MAP[command])
    return
  }

  // Handle unknown commands
  console.error(`❌ Unknown command: ${command}`)
  displayHelp()
  Deno.exit(1)
}

// Run the script if it's the main module
if (import.meta.main) {
  try {
    await main()
  } catch (error: unknown) {
    console.error(
      `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
    )
    Deno.exit(1)
  }
}
