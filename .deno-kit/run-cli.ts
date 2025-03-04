#!/usr/bin/env -S deno run --allow-all

/**
 * @module run-cli
 * @description Command-line interface for the Deno starter kit that helps developers test and interact with their library.
 *
 * The CLI provides an interactive interface to the core library functionality, making it easy
 * to test and validate your package during development.
 *
 * @example
 * ```bash
 * # Get started with the CLI to explore available commands
 * deno task kit cli help
 * ```
 *
 * For full documentation on the starter kit and its features, see the README.md
 */

import { parseArgs } from '@std/cli'
import { Lib } from '../src/lib.ts'
import { Logger } from '../src/core/logger.ts'
import { getPackageInfo } from './utils.ts'
import type { LibRequest, LibResult } from '../src/types.ts'

// Create a logger for the CLI
const logger = Logger.get('cli')

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
  console.log(`\n${NAME} v${VERSION}`)
  console.log('\nUsage:')
  console.log('  deno task kit cli <command> [options]')
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
  console.log('  cli.ts read --first-name="John" --last-name="Doe"\n')
}

/**
 * Displays version information
 */
function showVersion(): void {
  console.log(`${NAME} v${VERSION}`)
}

// Method map for typed execution
const methodMap = {
  create: (lib: Lib, params: LibRequest): LibResult => lib.create(params),
  read: (lib: Lib, params: LibRequest): LibResult => lib.read(params),
  update: (lib: Lib, params: LibRequest): LibResult => lib.update(params),
  destroy: (lib: Lib, params: LibRequest): LibResult => lib.destroy(params),
}

type CommandType = keyof typeof methodMap

/**
 * Main CLI function. Parses arguments and executes commands against all top-level
 * methods in the package's exports (what your have set for publish.include in deno.jsonc).
 */
function runCLI(): void {
  const args = parseArgs(Deno.args, {
    boolean: ['help', 'version'],
    alias: { h: 'help', v: 'version' },
    default: { help: false, version: false },
  })

  // Initialize our lib with empty config
  const lib = new Lib()

  // Handle help and version flags first
  if (args.help || args._[0] === 'help') {
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
    console.log(`\n${NAME} v${VERSION} - Interactive Mode`)
    console.log('\nAvailable commands:')
    for (const cmd of availableCommands) {
      console.log(`  - ${cmd}`)
    }
    console.log('\nRun with a command or use --help for more information\n')
    return
  }

  // Handle command from arguments
  const command = String(args._[0])

  // Find the first command that matches a key in methodMap
  const commandIndex = args._.findIndex((arg) =>
    typeof arg === 'string' && arg in methodMap
  )

  if (commandIndex >= 0) {
    // Remove all items before the matching command
    args._ = args._.slice(commandIndex)
  }

  if (!availableCommands.includes(command)) {
    console.error(`Unknown command '${command}'`)
    console.error('Run with --help to see available commands')
    Deno.exit(1)
  }
  console.log(`CLI received command: ${command} with parameters:`, args)
  // Parse remaining args into an object
  const parsedArgs = parseArgsToObject(args)

  // Execute the command if it's in our method map
  try {
    if (command in methodMap) {
      const result = methodMap[command as CommandType](lib, parsedArgs)
      console.log(JSON.stringify(parsedArgs, null, 2))
      console.log('\nResponse:')
      console.log(JSON.stringify(result, null, 2))
      console.log()
    } else {
      throw new Error(
        `Command ${command} is not implemented in the method map`,
      )
    }
  } catch (error) {
    // For CLI errors, write directly to stderr
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`Error executing ${command}: ${errorMessage}`)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    Deno.exit(1)
  }
}

if (import.meta.main) {
  runCLI()
}

// Export all functions at the bottom of the file
export { kebabToCamelCase, parseArgsToObject, runCLI }
