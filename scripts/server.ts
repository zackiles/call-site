import { Lib } from '../src/lib.ts'
import { getAvailablePort } from '@std/net'
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

export interface JsonRpcRequest {
  jsonrpc: string
  id: string | number
  method: string
  params?: Record<string, unknown>
}

export interface JsonRpcResponse {
  jsonrpc: string
  id: string | number | null
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

/**
 * Parse URL search params into a record
 */
export function parseSearchParams(url: URL): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of url.searchParams.entries()) {
    // Try to convert to proper types
    if (value === 'true') {
      result[key] = true
    } else if (value === 'false') {
      result[key] = false
    } else if (value === 'null') {
      result[key] = null
    } else if (!Number.isNaN(Number(value)) && value !== '') {
      result[key] = Number(value)
    } else {
      result[key] = value
    }
  }

  return result
}

/**
 * Get properly typed parameters for a method
 */
function getMethodParams(
  method: string,
  params: Record<string, unknown>,
): CreateOptions | ReadOptions | UpdateOptions | DestroyOptions {
  switch (method) {
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
 * Handle HTTP requests
 */
async function handleHttpRequest(
  request: Request,
  lib: Lib,
): Promise<Response> {
  const url = new URL(request.url)
  const pathParts = url.pathname.split('/').filter((part) => part)

  // Check if it's a request to the lib
  if (pathParts.length >= 2 && pathParts[0] === 'lib') {
    const method = pathParts[1]

    // Check if method exists and is a valid Lib method
    if (
      method === 'create' || method === 'read' || method === 'update' ||
      method === 'destroy'
    ) {
      try {
        let paramsObj: Record<string, unknown> = {}

        // For GET requests, use URL params
        if (request.method === 'GET') {
          paramsObj = parseSearchParams(url)
        } // For POST/PUT/DELETE, parse the JSON body
        else if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
          try {
            const body = await request.json()
            paramsObj = body as Record<string, unknown>
          } catch (error) {
            return new Response(
              JSON.stringify({ error: 'Invalid JSON body' }),
              {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
              },
            )
          }
        }

        // Get properly typed parameters for the method
        const params = getMethodParams(method, paramsObj)

        // Call the method with proper types
        let result: CreateResult | ReadResult | UpdateResult | DestroyResult

        switch (method) {
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
            throw new Error(`Unknown method: ${method}`)
        }

        // Return the result
        return new Response(
          JSON.stringify(result),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      }
    }
  }

  // If not found or not a valid method
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}

/**
 * Handle WebSocket connections with JSON-RPC protocol
 */
function handleWebSocket(ws: WebSocket, lib: Lib): void {
  ws.onopen = () => {
    console.log('WebSocket connection established')
  }

  ws.onmessage = (event) => {
    try {
      // Parse the JSON-RPC request
      const request = JSON.parse(event.data as string) as JsonRpcRequest

      // Create response object
      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: request.id || null,
      }

      // Validate JSON-RPC
      if (request.jsonrpc !== '2.0') {
        response.error = {
          code: -32600,
          message: 'Invalid Request: Invalid JSON-RPC version',
        }
        ws.send(JSON.stringify(response))
        return
      }

      // Extract method name and params
      const { method, params = {} } = request

      // Check if method exists and is a valid Lib method
      if (
        method === 'create' || method === 'read' || method === 'update' ||
        method === 'destroy'
      ) {
        try {
          // Get properly typed parameters
          const typedParams = getMethodParams(method, params)

          // Call the method with proper types
          let result: CreateResult | ReadResult | UpdateResult | DestroyResult

          switch (method) {
            case 'create':
              result = lib.create(typedParams as CreateOptions)
              break
            case 'read':
              result = lib.read(typedParams as ReadOptions)
              break
            case 'update':
              result = lib.update(typedParams as UpdateOptions)
              break
            case 'destroy':
              result = lib.destroy(typedParams as DestroyOptions)
              break
            default:
              throw new Error(`Unknown method: ${method}`)
          }

          // Set the result
          response.result = result
        } catch (error) {
          response.error = {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : String(error),
          }
        }
      } else {
        response.error = {
          code: -32601,
          message: 'Method not found',
        }
      }

      // Send the response
      ws.send(JSON.stringify(response))
    } catch (error) {
      // Parsing error
      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error',
          data: error instanceof Error ? error.message : String(error),
        },
      }
      ws.send(JSON.stringify(response))
    }
  }

  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
}

/**
 * Main handler for all requests
 */
function handler(request: Request): Response | Promise<Response> {
  const upgrade = request.headers.get('upgrade') || ''
  const lib = new Lib()

  // Check for WebSocket upgrade
  if (upgrade.toLowerCase() === 'websocket') {
    const { socket, response } = Deno.upgradeWebSocket(request)
    handleWebSocket(socket, lib)
    return response
  }

  // Handle HTTP requests
  return handleHttpRequest(request, lib)
}

/**
 * Start the server
 */
export async function startServer(options?: {
  port?: number
  hostname?: string
}): Promise<void> {
  const port = options?.port || Number(Deno.env.get('LIB_PORT')) ||
    getAvailablePort()
  const host = options?.hostname || Deno.env.get('LIB_HOST') || 'localhost'

  console.log(`Starting server on ${host}:${port}`)

  await Deno.serve({ port, hostname: host }, handler).finished
}

// Start the server if this module is executed directly
if (import.meta.main) {
  startServer()
}
