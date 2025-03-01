/**
 * Deno 2 Library Starter Kit
 * A modern Deno 2 library with CLI, HTTP, and WebSocket interfaces
 */

import { Logger } from "./src/logger.ts"

// Export the core library components
export { Lib } from "./src/lib.ts"
export { Logger } from "./src/logger.ts"
export { 
  withSpan, 
  getTracer, 
  initTelemetry, 
  getCurrentContext,
  createContextWithSpan,
  withContext,
  createSpan
} from "./src/telemetry.ts"

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
} from "./src/types.ts"

// Main entrypoint when executed directly
if (import.meta.main) {
  const logger = Logger.get('main')
  logger.info("Deno 2 Library Starter Kit")
  logger.info("To start the server: deno task start")
  logger.info("To use the CLI: deno task cli -- --help")
  logger.info("See README.md for more information")
} 
