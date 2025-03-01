/**
 * Core type definitions for the library
 */

/**
 * Configuration options for the Lib class
 */
export interface LibConfig {
  [key: string]: unknown
}

/**
 * Generic type for CRUD operation options
 */
export interface CrudOptions {
  [key: string]: unknown
}

/**
 * Generic type for CRUD operation results
 */
export interface CrudResult {
  [key: string]: unknown
}

// Type aliases for semantic clarity in API
export type CreateOptions = CrudOptions
export type CreateResult = CrudResult
export type ReadOptions = CrudOptions
export type ReadResult = CrudResult
export type UpdateOptions = CrudOptions
export type UpdateResult = CrudResult
export type DestroyOptions = CrudOptions
export type DestroyResult = CrudResult
