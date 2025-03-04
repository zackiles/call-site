/**
 * @module cli_test
 *
 * Tests for the CLI functionality provided by `.deno-kit/run-cli.ts`.
 * This module verifies that the command-line interface correctly interacts
 * with the library in `src/` through utility functions and command processing.
 *
 * Key test areas:
 * - Parameter conversion (kebab-case to camelCase)
 * - CLI argument parsing
 * - Integration with library methods
 * - Command availability and structure
 *
 * @note If you modify the library's API in `src/`, you'll need to update these tests
 * to match your new API structure, particularly:
 * - The expected method names in the Lib class integration test
 * - Any new parameter conversion cases
 * - Command structure validations
 */

import { assertEquals } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { Lib } from '../src/lib.ts'
import { kebabToCamelCase, parseArgsToObject } from '../.deno-kit/run-cli.ts'

describe('CLI utils', () => {
  it('should convert kebab-case to camelCase', () => {
    assertEquals(kebabToCamelCase('first-name'), 'firstName')
    assertEquals(kebabToCamelCase('last-name'), 'lastName')
    assertEquals(kebabToCamelCase('user-id'), 'userId')
    assertEquals(kebabToCamelCase('include-details'), 'includeDetails')
  })

  it('should parse CLI args to object', () => {
    const args = {
      _: ['read'],
      'first-name': 'John',
      'last-name': 'Doe',
      'include-details': true,
    }

    const result = parseArgsToObject(args)

    assertEquals(result.firstName, 'John')
    assertEquals(result.lastName, 'Doe')
    assertEquals(result.includeDetails, true)
  })

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
})
