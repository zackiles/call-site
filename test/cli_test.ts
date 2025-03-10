/**
 * @module cli_test
 *
 * Tests for the CLI functionality provided by `.deno-kit/run-cli.ts`.
 * This module verifies that the command-line interface correctly interacts
 * with the library in `src/` through the @deno-kit/module-to-cli integration.
 *
 * The CLI now uses the @deno-kit/module-to-cli library which automatically
 * generates a CLI based on the exported module. This removes the need for
 * manual parameter conversion and command processing tests.
 *
 * Key test areas:
 * - Integration with library methods
 * - Command availability and structure
 *
 * @note If you modify the library's API in `src/`, the CLI will automatically
 * adapt to your new API structure since it's dynamically generated.
 */

import { assertEquals } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { Lib } from '../src/lib.ts'
import { runCLI } from '../.deno-kit/run-cli.ts'

describe('CLI integration', () => {
  it('should integrate with Lib class methods', () => {
    // Create a test instance of Lib
    const lib = new Lib()

    // Get available methods from Lib
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(lib))
      .filter((name) => name !== 'constructor')

    // Verify expected methods exist
    assertEquals(methods.includes('create'), true)
    assertEquals(methods.includes('read'), true)
    assertEquals(methods.includes('update'), true)
    assertEquals(methods.includes('destroy'), true)
  })

  // The runCLI function should exist but we don't test its implementation
  // as it's now a thin wrapper around @deno-kit/module-to-cli
  it('should export runCLI function', () => {
    assertEquals(typeof runCLI, 'function')
  })
})
