import { Logger } from './logger.ts'
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

// Create a logger for the Lib class
const libLogger = Logger.get('lib')

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
    libLogger.debug('Lib instance created', { config })
  }

  /**
   * Creates a new resource
   * @param data The data to create
   * @returns The created data
   */
  create(data: CreateOptions): CreateResult {
    libLogger.info('Creating resource', { config: this.config, data })
    return data
  }

  /**
   * Reads a resource
   * @param query The query parameters
   * @returns The queried data
   */
  read(query: ReadOptions): ReadResult {
    libLogger.info('Reading resource', { config: this.config, query })
    return query
  }

  /**
   * Updates a resource
   * @param data The data to update
   * @returns The updated data
   */
  update(data: UpdateOptions): UpdateResult {
    libLogger.info('Updating resource', { config: this.config, data })
    return data
  }

  /**
   * Destroys a resource
   * @param query The query parameters for deletion
   * @returns The deleted data
   */
  destroy(query: DestroyOptions): DestroyResult {
    libLogger.info('Destroying resource', { config: this.config, query })
    return query
  }
}

export { Lib }
