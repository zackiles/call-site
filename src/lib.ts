import type {
  CreateOptions,
  CreateResult,
  DestroyOptions,
  DestroyResult,
  LibConfig,
  ReadOptions,
  ReadResult,
  UpdateOptions,
  UpdateResult,
} from './types.ts'

/**
 * Lib class provides core CRUD functionality
 */
class Lib {
  private config: LibConfig

  /**
   * Creates a new Lib instance
   * @param config Configuration object for the Lib instance
   */
  constructor(config: LibConfig = {}) {
    this.config = config
  }

  /**
   * Creates a new resource
   * @param data The data to create
   * @returns The created data
   */
  create(data: CreateOptions): CreateResult {
    console.log('Creating with config:', this.config)
    return data
  }

  /**
   * Reads a resource
   * @param query The query parameters
   * @returns The queried data
   */
  read(query: ReadOptions): ReadResult {
    console.log('Reading with config:', this.config)
    return query
  }

  /**
   * Updates a resource
   * @param data The data to update
   * @returns The updated data
   */
  update(data: UpdateOptions): UpdateResult {
    console.log('Updating with config:', this.config)
    return data
  }

  /**
   * Destroys a resource
   * @param query The query parameters for deletion
   * @returns The deleted data
   */
  destroy(query: DestroyOptions): DestroyResult {
    console.log('Destroying with config:', this.config)
    return query
  }
}

export { Lib }
