import { parseArgs } from '@std/cli'
import { Lib } from '../src/lib.ts'
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

// Get package info from deno.json
let VERSION = '0.0.1'
let NAME = '@zackiles/starter-lib'

try {
  const denoJson = JSON.parse(Deno.readTextFileSync('./deno.json'))
  VERSION = denoJson.version || VERSION
  NAME = denoJson.name || NAME
} catch (error) {
  // Use defaults if deno.json is not available
  console.log('Note: Using default package info. deno.json not found.', error)
}

/**
 * Converts kebab-case CLI arguments to camelCase for method parameters
 */
export function kebabToCamelCase(str: string): string {
  return str.replace(/(-\w)/g, (match) => match[1].toUpperCase())
}

/**
 * Converts kebab-case CLI arguments to a proper object
 */
export function parseArgsToObject(
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
  console.log(`${NAME} v${VERSION}`)
  console.log('\nUsage:')
  console.log('  cli.ts <command> [options]')
  console.log('\nCommands:')

  // Get all methods from the Lib prototype that are not the constructor
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(lib))
    .filter((name) => name !== 'constructor')

  for (const method of methods) {
    console.log(`  ${method} \t- Execute the ${method} operation`)
  }

  console.log('\nOptions:')
  console.log('  --help, -h \t- Display this help message')
  console.log('  --version, -v \t- Display version information')
  console.log('\nExample:')
  console.log('  cli.ts read --first-name="John" --last-name="Doe"')
}

/**
 * Displays version information
 */
function showVersion(): void {
  console.log(`${NAME} v${VERSION}`)
}

/**
 * Get command parameters based on command type
 */
function getCommandParams(
  command: string,
  params: Record<string, unknown>,
): CreateOptions | ReadOptions | UpdateOptions | DestroyOptions {
  switch (command) {
    case 'create':
      return params as CreateOptions
    case 'read':
      return params as ReadOptions
    case 'update':
      return params as UpdateOptions
    case 'destroy':
      return params as DestroyOptions
    default:
      return params as Record<string, unknown>
  }
}

/**
 * Main CLI function
 */
async function main(): Promise<void> {
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
    console.log(`${NAME} v${VERSION} - Interactive Mode`)
    console.log('Available commands:')
    for (const cmd of availableCommands) {
      console.log(`  - ${cmd}`)
    }
    console.log('\nRun with a command or use --help for more information')
    return
  }

  // Handle command from arguments
  const command = String(args._[0])

  if (!availableCommands.includes(command)) {
    console.error(`Error: Unknown command '${command}'`)
    console.error('Run with --help to see available commands')
    Deno.exit(1)
  }

  // Parse remaining args into an object
  const parsedArgs = parseArgsToObject(args)

  // Get properly typed parameters for the command
  const params = getCommandParams(command, parsedArgs)

  // Execute the command
  try {
    let result: CreateResult | ReadResult | UpdateResult | DestroyResult

    // Call method with appropriate types
    switch (command) {
      case 'create':
        result = lib.create(params as CreateOptions)
        break
      case 'read':
        result = lib.read(params as ReadOptions)
        break
      case 'update':
        result = lib.update(params as UpdateOptions)
        break
      case 'destroy':
        result = lib.destroy(params as DestroyOptions)
        break
      default:
        throw new Error(`Unknown command: ${command}`)
    }

    console.log(JSON.stringify(result, null, 2))
  } catch (error: unknown) {
    console.error(
      `Error executing ${command}:`,
      error instanceof Error ? error.message : String(error),
    )
    Deno.exit(1)
  }
}

if (import.meta.main) {
  main()
}
