/**
 * Configuration options for the Lib class
 */
interface LibConfig {
  [key: string]: unknown
}

/**
 * Options for creating a resource
 */
interface CreateOptions {
  [key: string]: unknown
}

/**
 * Result of creating a resource
 */
interface CreateResult {
  [key: string]: unknown
}

/**
 * Options for reading a resource
 */
interface ReadOptions {
  [key: string]: unknown
}

/**
 * Result of reading a resource
 */
interface ReadResult {
  [key: string]: unknown
}

/**
 * Options for updating a resource
 */
interface UpdateOptions {
  [key: string]: unknown
}

/**
 * Result of updating a resource
 */
interface UpdateResult {
  [key: string]: unknown
}

/**
 * Options for destroying a resource
 */
interface DestroyOptions {
  [key: string]: unknown
}

/**
 * Result of destroying a resource
 */
interface DestroyResult {
  [key: string]: unknown
}

export type {
  CreateOptions,
  CreateResult,
  DestroyOptions,
  DestroyResult,
  LibConfig,
  ReadOptions,
  ReadResult,
  UpdateOptions,
  UpdateResult,
}
