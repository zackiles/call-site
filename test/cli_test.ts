import { assertEquals } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { Lib } from '../src/lib.ts'
import { kebabToCamelCase, parseArgsToObject } from '../.deno-kit/host-cli.ts'

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
