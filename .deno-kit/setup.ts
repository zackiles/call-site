#!/usr/bin/env -S deno run --allow-all

/**
 * @module generate
 * @description Template generator for Deno libraries
 *
 * This script generates a new Deno library from templates, replacing placeholders
 * with user-provided values. It handles package metadata, GitHub information,
 * and other configuration details.
 *
 * @example
 * ```bash
 * deno run --allow-read --allow-write --allow-run --allow-env .deno-kit/generate.ts
 * ```
 */

import { basename, join } from '@std/path'
import { getConfig } from './config.ts'

// Get configuration to access kitDir and templatesDir
const config = await getConfig()

// Define the template placeholders and their corresponding values
interface TemplateValues {
  PACKAGE_NAME: string
  PACKAGE_SCOPE: string
  PACKAGE_VERSION: string
  PACKAGE_AUTHOR_NAME: string
  PACKAGE_AUTHOR_EMAIL: string
  PACKAGE_DESCRIPTION: string
  PACKAGE_GITHUB_USER: string
  YEAR: string
  PROJECT_NAME: string
  [key: string]: string // Add index signature for string keys
}

// Template file mappings (source -> destination)
const TEMPLATE_MAPPINGS = {
  [join(config.templatesDir, 'README.template.md')]: './README.md',
  [join(config.templatesDir, 'deno.template.jsonc')]: './deno.jsonc',
  [join(config.templatesDir, 'CONTRIBUTING.template.MD')]: './CONTRIBUTING.md',
  [join(config.templatesDir, 'LICENSE.template')]: './LICENSE',
}

/**
 * Gets the git user name from git config
 *
 * @returns {Promise<string>} The git user name or empty string if not found
 */
async function getGitUserName(): Promise<string> {
  try {
    const command = new Deno.Command('git', {
      args: ['config', 'user.name'],
      stdout: 'piped',
    })

    const { stdout } = await command.output()
    const decoder = new TextDecoder()
    return decoder.decode(stdout).trim()
  } catch (_error) {
    return ''
  }
}

/**
 * Gets the git user email from git config
 *
 * @returns {Promise<string>} The git user email or empty string if not found
 */
async function getGitUserEmail(): Promise<string> {
  try {
    const command = new Deno.Command('git', {
      args: ['config', 'user.email'],
      stdout: 'piped',
    })

    const { stdout } = await command.output()
    const decoder = new TextDecoder()
    return decoder.decode(stdout).trim()
  } catch (_error) {
    return ''
  }
}

/**
 * Prompts the user for input with a default value
 *
 * @param {string} promptText - The text to display to the user
 * @param {string} defaultValue - The default value to use if the user doesn't provide input
 * @returns {Promise<string>} The user input or the default value
 */
async function promptWithDefault(
  promptText: string,
  defaultValue: string,
): Promise<string> {
  const promptWithDefault = defaultValue
    ? `${promptText} [${defaultValue}]: `
    : `${promptText}: `

  console.log(promptWithDefault)

  const buf = new Uint8Array(1024)
  const n = await Deno.stdin.read(buf)
  if (n === null) {
    return defaultValue
  }

  const input = new TextDecoder().decode(buf.subarray(0, n)).trim()
  return input || defaultValue
}

/**
 * Validates a package name to ensure it's in the format @scope/name
 *
 * @param {string} packageName - The package name to validate
 * @returns {boolean} True if the package name is valid, false otherwise
 */
function isValidPackageName(packageName: string): boolean {
  return /^@[a-z0-9-]+\/[a-z0-9-]+$/.test(packageName)
}

/**
 * Extracts the scope from a package name
 *
 * @param {string} packageName - The package name to extract the scope from
 * @returns {string} The scope (including @) or empty string if not found
 */
function extractScope(packageName: string): string {
  const match = packageName.match(/^(@[a-z0-9-]+)\/[a-z0-9-]+$/)
  return match ? match[1] : ''
}

/**
 * Extracts the project name from a package name (without scope)
 *
 * @param {string} packageName - The package name to extract the project name from
 * @returns {string} The project name (without scope) or the original package name
 */
function extractProjectName(packageName: string): string {
  const match = packageName.match(/^@[a-z0-9-]+\/([a-z0-9-]+)$/)
  return match ? match[1] : packageName
}

/**
 * Gathers all template values from user input
 *
 * @returns {Promise<TemplateValues>} The template values provided by the user
 */
async function gatherTemplateValues(): Promise<TemplateValues> {
  // Get default values
  const defaultName = await getGitUserName()
  const defaultEmail = await getGitUserEmail()
  const currentYear = new Date().getFullYear().toString()

  // Prompt for package name with validation
  let packageName = ''
  do {
    packageName = await promptWithDefault(
      'Enter package name (format: @scope/name)',
      '@my-org/my-lib',
    )

    if (!isValidPackageName(packageName)) {
      console.error(
        'Invalid package name format. It must be in the format @scope/name (e.g., @deno/example)',
      )
    }
  } while (!isValidPackageName(packageName))

  // Extract scope and project name
  const packageScope = extractScope(packageName)
  const projectName = extractProjectName(packageName)

  // Get default GitHub username from package scope (without the @ symbol)
  const defaultGithubUser = packageScope.replace('@', '')

  // Gather remaining values
  const packageVersion = await promptWithDefault(
    'Enter package version',
    '0.0.1',
  )

  const authorName = await promptWithDefault(
    'Enter author name',
    defaultName,
  )

  const authorEmail = await promptWithDefault(
    'Enter author email',
    defaultEmail,
  )

  const packageDescription = await promptWithDefault(
    'Enter package description',
    'A Deno library',
  )

  const githubUser = await promptWithDefault(
    'Enter GitHub username or organization',
    defaultGithubUser,
  )

  // Return all gathered values
  return {
    PACKAGE_NAME: packageName,
    PACKAGE_SCOPE: packageScope,
    PACKAGE_VERSION: packageVersion,
    PACKAGE_AUTHOR_NAME: authorName,
    PACKAGE_AUTHOR_EMAIL: authorEmail,
    PACKAGE_DESCRIPTION: packageDescription,
    PACKAGE_GITHUB_USER: githubUser,
    YEAR: currentYear,
    PROJECT_NAME: projectName,
  }
}

/**
 * Replaces all placeholders in a string with their values
 *
 * @param {string} content - The content containing placeholders
 * @param {TemplateValues} values - The values to replace placeholders with
 * @returns {string} The content with placeholders replaced
 */
function replacePlaceholders(
  content: string,
  values: TemplateValues,
): string {
  return content.replace(
    /{([A-Z_]+)}/g,
    (_match, placeholder) =>
      placeholder in values ? values[placeholder] : _match,
  )
}

/**
 * Creates the templates backup directory if it doesn't exist
 *
 * @returns {Promise<void>}
 */
async function ensureTemplatesBackupDir(): Promise<void> {
  try {
    await Deno.mkdir(config.templatesDir, { recursive: true })
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error
    }
  }
}

/**
 * Backs up an existing file before overwriting it
 *
 * @param {string} filePath - The path of the file to back up
 * @returns {Promise<boolean>} True if the file was backed up, false otherwise
 */
async function backupExistingFile(filePath: string): Promise<boolean> {
  try {
    // Check if the file exists
    await Deno.stat(filePath)

    // Get file name
    const fileName = basename(filePath)
    const backupPath = join(config.templatesDir, `${fileName}.backup`)

    // Copy the file to backup location
    await Deno.copyFile(filePath, backupPath)
    console.log(`🔄 Backed up ${filePath} to ${backupPath}`)
    return true
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // File doesn't exist, no backup needed
      return false
    }
    console.error(`⚠️ Failed to backup ${filePath}:`, error)
    return false
  }
}

/**
 * Processes a template file and writes it to the destination
 *
 * @param {string} templatePath - The path to the template file
 * @param {string} destPath - The path to write the processed file to
 * @param {TemplateValues} values - The values to replace placeholders with
 * @returns {Promise<void>}
 */
async function processTemplate(
  templatePath: string,
  destPath: string,
  values: TemplateValues,
): Promise<void> {
  try {
    // Ensure backup directory exists
    await ensureTemplatesBackupDir()

    // Backup existing file if it exists
    await backupExistingFile(destPath)

    // Read template file
    const content = await Deno.readTextFile(templatePath)

    // Replace placeholders
    const processedContent = replacePlaceholders(content, values)

    // Write to destination
    await Deno.writeTextFile(destPath, processedContent)

    console.log(`✅ Created ${destPath}`)
  } catch (error) {
    console.error(`❌ Error processing template ${templatePath}:`, error)
  }
}

/**
 * Processes the .env template file, only if .env doesn't exist
 *
 * @param {TemplateValues} values - The values to replace placeholders with
 * @returns {Promise<void>}
 */
async function processEnvTemplate(values: TemplateValues): Promise<void> {
  const templatePath = join(config.templatesDir, '.env.template')
  const destPath = './.env'

  try {
    // Check if .env already exists
    try {
      await Deno.stat(destPath)
      // Backup existing .env file
      await ensureTemplatesBackupDir()
      await backupExistingFile(destPath)
      console.log(`ℹ️ ${destPath} already exists, backing up and overwriting`)
    } catch (_error) {
      // File doesn't exist, continue processing
    }

    // Process the template
    await processTemplate(templatePath, destPath, values)
  } catch (error) {
    console.error('❌ Error processing .env template:', error)
  }
}

/**
 * Runs deno install after template processing
 *
 * @returns {Promise<void>}
 */
async function runDenoInstall(): Promise<void> {
  console.log('🦕 Running deno install...')

  try {
    const command = new Deno.Command('deno', {
      args: ['install'],
      stdout: 'piped',
      stderr: 'piped',
    })

    const { stdout, stderr } = await command.output()

    const textDecoder = new TextDecoder()
    console.log(textDecoder.decode(stdout))

    const stderrOutput = textDecoder.decode(stderr)
    if (stderrOutput) {
      console.error(stderrOutput)
    }

    console.log('✅ Deno install completed')
  } catch (error) {
    console.error('❌ Error running deno install:', error)
  }
}

/**
 * Main function for template generation
 *
 * @returns {Promise<void>}
 */
async function generate(): Promise<void> {
  console.log('🦕 Deno Library Template Generator')
  console.log('---------------------------------')

  // Gather all values from user input
  const templateValues = await gatherTemplateValues()

  console.log('\nℹ️ Using the following values:')
  console.table(templateValues)

  // Process all template files
  for (const [templatePath, destPath] of Object.entries(TEMPLATE_MAPPINGS)) {
    await processTemplate(templatePath, destPath, templateValues)
  }

  // Process .env template if needed
  await processEnvTemplate(templateValues)

  // Run deno install
  await runDenoInstall()

  console.log('\n🎉 All done! Your Deno library is ready to use.')
  console.log('📦 Package:', templateValues.PACKAGE_NAME)
}

if (import.meta.main) {
  await generate()
}

export type { TemplateValues }
export {
  backupExistingFile,
  ensureTemplatesBackupDir,
  extractProjectName,
  extractScope,
  gatherTemplateValues,
  generate,
  isValidPackageName,
  processTemplate,
  replacePlaceholders,
}
