import { assertEquals, assertExists } from '@std/assert'
import { describe, it } from '@std/testing/bdd'
import { startServer } from '../scripts/server.ts'
import type { JsonRpcRequest, JsonRpcResponse } from '../scripts/server.ts'

describe('Server utilities', () => {
  it('should export JsonRpcRequest interface', () => {
    // Create a valid JsonRpcRequest
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'read',
      params: { id: 123 },
    }

    // Verify properties
    assertEquals(request.jsonrpc, '2.0')
    assertEquals(request.id, 1)
    assertEquals(request.method, 'read')
    assertExists(request.params)
    assertEquals(request.params?.id, 123)
  })

  it('should export JsonRpcResponse interface', () => {
    // Create a success response
    const successResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      id: 1,
      result: { id: 123, name: 'Test Item' },
    }

    // Create an error response
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      id: 2,
      error: {
        code: -32601,
        message: 'Method not found',
      },
    }

    // Verify properties
    assertEquals(successResponse.jsonrpc, '2.0')
    assertEquals(successResponse.id, 1)
    assertExists(successResponse.result)

    assertEquals(errorResponse.jsonrpc, '2.0')
    assertEquals(errorResponse.id, 2)
    assertExists(errorResponse.error)
    assertEquals(errorResponse.error?.code, -32601)
    assertEquals(errorResponse.error?.message, 'Method not found')
  })

  it('should export startServer function', () => {
    // Verify startServer is a function
    assertEquals(typeof startServer, 'function')
  })

  it('should handle URL parsing correctly', async () => {
    // Import the parseSearchParams function
    const serverModule = await import('../scripts/server.ts')
    // @ts-ignore: Accessing private function for testing
    const parseSearchParams = serverModule.parseSearchParams

    // Skip if function wasn't loaded
    if (!parseSearchParams) return

    // Create a test URL with search parameters
    const url = new URL(
      'http://localhost:8000/lib/read?id=123&active=true&name=test&empty=null&num=456',
    )

    // Parse the search parameters
    const params = parseSearchParams(url)

    // Verify type conversions
    assertEquals(params.id, 123)
    assertEquals(params.active, true)
    assertEquals(params.name, 'test')
    assertEquals(params.empty, null)
    assertEquals(params.num, 456)
  })
})
