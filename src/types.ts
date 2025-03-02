/**
 * Core type definitions for the library
 */

/**
 * Configuration options for the Lib class
 */
interface LibConfig {
  [key: string]: unknown
}

/**
 * Generic type for CRUD operation options and results
 */
interface CrudOptions {
  [key: string]: unknown
}

interface CrudResult {
  [key: string]: unknown
}

/**
 * Aliases for each CRUD operation - all share the same underlying types
 * but provide semantic clarity at API boundaries
 */
// CRUD operation aliases - Using common base types for type safety
// while maintaining semantic differentiation in API signatures
type CreateOptions = CrudOptions
type CreateResult = CrudResult
type ReadOptions = CrudOptions
type ReadResult = CrudResult
type UpdateOptions = CrudOptions
type UpdateResult = CrudResult
type DestroyOptions = CrudOptions
type DestroyResult = CrudResult

export type {
  // Operation-specific aliases
  CreateOptions,
  CreateResult,
  // Base types
  CrudOptions,
  CrudResult,
  DestroyOptions,
  DestroyResult,
  LibConfig,
  ReadOptions,
  ReadResult,
  UpdateOptions,
  UpdateResult,
}
