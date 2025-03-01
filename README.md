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

## Environment Variables

This library supports various environment variables for configuration:

### General Configuration

- `DENO_ENV` - Environment mode (development, production)
- `NODE_ENV` - Node.js environment mode (for compatibility)

### Library Configuration

- `LIB_PORT` - Port for the HTTP/WebSocket server (default: 8000)
- `LIB_HOST` - Host for the HTTP/WebSocket server (default: localhost)
- `LIB_LOG_NAME` - Name for the logger output
- `LIB_LOG_LEVEL` - Logging level (debug, verbose, info, warn, error)
- `LIB_LOG_TAGS` - Comma-separated list of tags to include in logs

### OpenTelemetry Configuration

#### Core Settings

- `OTEL_DENO` - Enable OpenTelemetry for Deno (true/false)
- `OTEL_SERVICE_NAME` - Name of the service for telemetry
- `OTEL_SERVICE_NAMESPACE` - Namespace for the service
- `OTEL_SERVICE_VERSION` - Version of the service
- `OTEL_RESOURCE_ATTRIBUTES` - Additional resource attributes

#### Exporter Configuration

- `OTEL_EXPORTER_TYPE` - Type of exporter (console, otlp)
- `OTEL_EXPORTER_ENDPOINT` - Endpoint for the exporter
- `OTEL_EXPORTER_PROTOCOL` - Protocol for the exporter
- `OTEL_EXPORTER_TIMEOUT_MILLIS` - Timeout for the exporter in milliseconds

#### Data Collection Settings

- `OTEL_TRACE_ENABLED` - Enable trace collection
- `OTEL_METRICS_ENABLED` - Enable metrics collection
- `OTEL_LOGS_ENABLED` - Enable logs collection

#### Sampling and Performance

- `OTEL_SAMPLING_RATE` - Sampling rate for traces (0.0-1.0)
- `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT` - Maximum number of attributes per span
- `OTEL_SPAN_EVENT_COUNT_LIMIT` - Maximum number of events per span
- `OTEL_SPAN_LINK_COUNT_LIMIT` - Maximum number of links per span
- `OTEL_TRACES_SAMPLER` - Sampling strategy

You can copy the `.env.example` file to `.env` and customize these variables for your environment.

## License

MIT
