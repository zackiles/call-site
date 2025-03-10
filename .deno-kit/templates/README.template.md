# "{PACKAGE_SCOPE}/{PACKAGE_NAME}"

[![JSR Score](https://jsr.io/badges/{PACKAGE_SCOPE}/{PACKAGE_NAME}/score)](https://jsr.io/{PACKAGE_SCOPE}/{PACKAGE_NAME})
[![JSR](https://jsr.io/badges/{PACKAGE_SCOPE}/{PACKAGE_NAME})](https://jsr.io/{PACKAGE_SCOPE}/{PACKAGE_NAME})
[![JSR Scope](https://jsr.io/badges/{PACKAGE_SCOPE})](https://jsr.io/{PACKAGE_SCOPE})

{PACKAGE_DESCRIPTION}

## Features

🚀 **Guided Setup:** Quickly generate your next package with guided setup and
intelligent defaults. 🦖 **Modern Deno 2 Features:** Using the latest Deno 2
APIs and practices such as OpenTelemetry. 🤖 **AI-Native:** Includes a complete
set of Deno-optimized AI triggers and meta prompts in `.cursor/rules` to
jump-start your project. 🔒 **Safe Defaults:** Achieve a 100%
[JSR score](https://jsr.io/docs/scoring) with safe defaults and comprehensive
TypeScript coverage.

### Prerequisites

- [Deno](https://deno.com/) v2.0 or newer
- **Note:** if you're building a browser-based library you will have to add
  additional libraries to `compilerOptions.lib` in `deno.jsonc` such as `dom`.
  For more info see:
  [DenoDocs - CompilerOptions](https://docs.deno.com/runtime/reference/ts_config_migration/)

### Installation

#### For Development and Testing

1. Clone this repository
2. Install dependencies: `deno install`
3. Run one of the deno tasks listed in "Development Scripts"

#### For Production Use

```bash
# Install from JSR registry
deno add {PACKAGE_SCOPE}/{PACKAGE_NAME}
```

## Core Library Usage

```typescript
import { type CreateOptions, Lib, type ReadOptions } from "{PACKAGE_SCOPE}/{PACKAGE_NAME}";

// Create a new instance with custom config
const lib = new Lib({ apiKey: "your-api-key" });

// Create operation with strongly-typed parameters
const createData: CreateOptions = { name: "Test Item", value: 123 };
const result = lib.create(createData);
console.log(result);

// Read operation
const readParams: ReadOptions = { id: 123 };
const item = lib.read(readParams);
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

## License

MIT
