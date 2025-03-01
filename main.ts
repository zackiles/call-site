/**
 * Deno 2 Library Starter Kit
 * A modern Deno 2 library with CLI, HTTP, and WebSocket interfaces
 */

// Export the core library
export { Lib } from "./src/lib.ts"

// Export type definitions for library usage
export type {
  LibConfig,
  CreateOptions,
  CreateResult,
  ReadOptions,
  ReadResult,
  UpdateOptions,
  UpdateResult,
  DestroyOptions,
  DestroyResult
} from "./src/lib.ts"

// Main entrypoint when executed directly
if (import.meta.main) {
  console.log("Deno 2 Library Starter Kit")
  console.log("To start the server: deno task start")
  console.log("To use the CLI: deno task cli -- --help")
  console.log("See README.md for more information")
} 
