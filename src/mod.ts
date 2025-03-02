/**
 * Main entry point for the library to be published
 * Exports the library and all type definitions
 */

// The main library to be published
export { Lib } from './lib.ts'

// Any types to be published along with the library
export type {
  CreateOptions,
  CreateResult,
  CrudOptions,
  CrudResult,
  DestroyOptions,
  DestroyResult,
  LibConfig,
  ReadOptions,
  ReadResult,
  UpdateOptions,
  UpdateResult,
} from './types.ts'

// Export complimentary utilities to be published as needed
export { getPackageInfo } from './utils.ts'
