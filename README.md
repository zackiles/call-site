# Deno 2 Library Starter Kit

A modern Deno 2 library starter kit with strongly typed CRUD operations and optional CLI, HTTP, and WebSocket interfaces for testing.

## Features

- **Core Library:** A simple, strongly-typed class-based library with CRUD operations
- **Type Definitions:** Comprehensive TypeScript interfaces for all operations
- **Optional Testing Tools:**
  - CLI Interface: For quick command-line testing
  - HTTP API: RESTful endpoints for browser/HTTP client testing
  - WebSocket API: JSON-RPC interface for real-time communication testing
- **Modern Deno 2 Features:** Using the latest Deno 2 APIs and practices

## Getting Started

### Prerequisites

- [Deno](https://deno.com/) v2.0 or newer

### Installation

#### For Development and Testing

1. Clone this repository
2. Install dependencies: `deno cache -r main.ts`

#### For Production Use

```bash
# Install from JSR registry
deno add @zackiles/starter-lib
```

## Core Library Usage

```typescript
import {
  type CreateOptions,
  Lib,
  type ReadOptions,
} from '@zackiles/starter-lib'

// Create a new instance with custom config
const lib = new Lib({ apiKey: 'your-api-key' })

// Create operation with strongly-typed parameters
const createData: CreateOptions = { name: 'Test Item', value: 123 }
const result = lib.create(createData)
console.log(result)

// Read operation
const readParams: ReadOptions = { id: 123 }
const item = lib.read(readParams)
```

## Available Types

The library exports the following TypeScript interfaces:

- `LibConfig` - Configuration for the Lib constructor
- `CreateOptions` - Options for the create method
- `CreateResult` - Return type for the create method
- `ReadOptions` - Options for the read method
- `ReadResult` - Return type for the read method
- `UpdateOptions` - Options for the update method
- `UpdateResult` - Return type for the update method
- `DestroyOptions` - Options for the destroy method
- `DestroyResult` - Return type for the destroy method

## Testing and Development Tools

This library comes with optional tools to help with testing and development:

### CLI Interface

```bash
# Show help
deno task cli -- --help

# Execute a method
deno task cli -- read --id=123 --include-details=true
```

### HTTP API

```bash
# Start the HTTP server
deno task start

# Make requests
GET {LIB_HOST}:{LIB_PORT}/lib/read?id=123
POST {LIB_HOST}:{LIB_PORT}/lib/create
  {"name": "New Item", "value": 456}
```

### WebSocket API

```javascript
const ws = new WebSocket(`ws://${LIB_HOST}:${LIB_PORT}/lib/read`)
ws.onopen = () => {
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'read',
    params: { id: 123 },
  }))
}
```

## Development Scripts

- `deno task server` - Start the HTTP/WebSocket server
- `deno task server:dev` - Start the server in development mode (watch for changes)
- `deno task cli` - Run the CLI interface
- `deno task cli:dev` - Run the CLI in development mode
- `deno task test` - Run the tests
- `deno task fmt` - Format the code
- `deno task lint` - Lint the code

## Extending

To extend this starter kit:

1. Add new methods to the `Lib` class in `src/lib.ts`
2. Define appropriate TypeScript interfaces for the parameters and return types
3. Export the new types in `main.ts`
4. Update tests as needed

## License

MIT
