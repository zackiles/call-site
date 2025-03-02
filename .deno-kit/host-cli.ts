import { parseArgs } from '@std/cli'
import { Lib } from '../src/lib.ts'
import { Logger } from '../src/logger.ts'
import { getPackageInfo } from '../src/utils.ts'
import type {
  CreateOptions,
  CreateResult,
  DestroyOptions,
  DestroyResult,
  ReadOptions,
  ReadResult,
  UpdateOptions,
  UpdateResult,
} from '../src/types.ts'

// Create a logger for the CLI
const cliLogger = Logger.get('cli')

// Get package info from deno.jsonc
const { name: NAME, version: VERSION } = getPackageInfo()

/**
 * Converts kebab-case CLI arguments to camelCase for method parameters
 */
function kebabToCamelCase(str: string): string {
  return str.replace(/(-\w)/g, (match) => match[1].toUpperCase())
}

/**
 * Converts kebab-case CLI arguments to a proper object
 */
function parseArgsToObject(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(args)) {
    // Skip the command and subcommand
    if (key === '_' || key === 'command') continue
    // Convert kebab-case to camelCase
    const camelKey = kebabToCamelCase(key)
    result[camelKey] = value
  }

  return result
}

/**
 * Displays help menu
 */
function showHelp(lib: Lib): void {
  cliLogger.info(`${NAME} v${VERSION}`)
  cliLogger.info('\nUsage:')
  cliLogger.info('  cli.ts <command> [options]')
  cliLogger.info('\nCommands:')

  // Get all methods from the Lib prototype that are not the constructor
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(lib))
    .filter((name) => name !== 'constructor')

  for (const method of methods) {
    cliLogger.info(`  ${method} \t- Execute the ${method} operation`)
  }

  cliLogger.info('\nOptions:')
  cliLogger.info('  --help, -h \t- Display this help message')
  cliLogger.info('  --version, -v \t- Display version information')
  cliLogger.info('\nExample:')
  cliLogger.info('  cli.ts read --first-name="John" --last-name="Doe"')
}

/**
 * Displays version information
 */
function showVersion(): void {
  cliLogger.info(`${NAME} v${VERSION}`)
}

// Method map for typed execution
const methodMap = {
  create: (lib: Lib, params: CreateOptions): CreateResult => lib.create(params),
  read: (lib: Lib, params: ReadOptions): ReadResult => lib.read(params),
  update: (lib: Lib, params: UpdateOptions): UpdateResult => lib.update(params),
  destroy: (lib: Lib, params: DestroyOptions): DestroyResult =>
    lib.destroy(params),
}

type CommandType = keyof typeof methodMap

/**
 * Main CLI function. Parses arguments and executes commands against all top-level
 * methods in the package's exports (what your have set for publish.include in deno.jsonc).
 */
function startCLI(): void {
  const args = parseArgs(Deno.args, {
    boolean: ['help', 'version'],
    alias: { h: 'help', v: 'version' },
    default: { help: false, version: false },
  })

  // Initialize our lib with empty config
  const lib = new Lib()

  // Handle help and version flags
  if (args.help) {
    showHelp(lib)
    return
  }

  if (args.version) {
    showVersion()
    return
  }

  // Get available commands from Lib class
  const availableCommands = Object.getOwnPropertyNames(
    Object.getPrototypeOf(lib),
  )
    .filter((name) => name !== 'constructor')

  // Interactive mode if no command provided
  if (args._.length === 0) {
    cliLogger.info(`${NAME} v${VERSION} - Interactive Mode`)
    cliLogger.info('Available commands:')
    for (const cmd of availableCommands) {
      cliLogger.info(`  - ${cmd}`)
    }
    cliLogger.info('\nRun with a command or use --help for more information')
    return
  }

  // Handle command from arguments
  const command = String(args._[0])

  if (!availableCommands.includes(command)) {
    cliLogger.error(`Unknown command '${command}'`)
    cliLogger.error('Run with --help to see available commands')
    Deno.exit(1)
  }

  // Parse remaining args into an object
  const parsedArgs = parseArgsToObject(args)
  cliLogger.debug(`Executing ${command} with parameters`, {
    params: parsedArgs,
  })

  // Execute the command if it's in our method map
  try {
    if (command in methodMap) {
      const result = methodMap[command as CommandType](lib, parsedArgs)
      cliLogger.info(JSON.stringify(result, null, 2))
    } else {
      throw new Error(
        `Command ${command} is not implemented in the method map`,
      )
    }
  } catch (error) {
    cliLogger.error(
      `Error executing ${command}:`,
      { error: error instanceof Error ? error : new Error(String(error)) },
    )
    Deno.exit(1)
  }
}

if (import.meta.main) {
  startCLI()
}

// Export all functions at the bottom of the file
export { kebabToCamelCase, parseArgsToObject, startCLI }
