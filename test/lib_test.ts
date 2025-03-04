import { assertEquals } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { Lib } from '../src/lib.ts'
import type { LibConfig, LibRequest } from '../src/types.ts'

describe('Lib', () => {
  const testConfig: LibConfig = { testKey: 'test-value' }
  const testData: LibRequest = {
    id: 123,
    name: 'Test Item',
  }

  it('should create and return data', () => {
    const lib = new Lib(testConfig)
    const result = lib.create(testData)
    assertEquals(result, testData)
  })

  it('should read and return query', () => {
    const lib = new Lib(testConfig)
    const result = lib.read(testData)
    assertEquals(result, testData)
  })

  it('should update and return data', () => {
    const lib = new Lib(testConfig)
    const result = lib.update(testData)
    assertEquals(result, testData)
  })

  it('should destroy and return query', () => {
    const lib = new Lib(testConfig)
    const result = lib.destroy(testData)
    assertEquals(result, testData)
  })
})
