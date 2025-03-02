#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env --allow-net

import { emptyDir, ensureDir } from 'jsr:@std/fs@1'
import { join } from 'jsr:@std/path@1'

// GitHub repository containing the cursor config files
const CURSOR_CONFIG_REPO = 'https://github.com/zackiles/cursor-config'

/**
 * Fetches and copies the .cursor folder from the cursor-config GitHub repository
 */
export async function update(): Promise<void> {
  console.log('🔄 Fetching and copying Cursor configuration from GitHub...')

  // Create temporary directory for cloning
  const tempDir = './__temp_cursor_config'

  try {
    // Ensure temp directory exists and is empty
    await ensureDir(tempDir)
    await emptyDir(tempDir)

    // Clone the repository
    console.log(`📥 Cloning ${CURSOR_CONFIG_REPO} into temporary directory...`)
    const cloneCommand = new Deno.Command('git', {
      args: ['clone', '--depth', '1', CURSOR_CONFIG_REPO, tempDir],
      stdout: 'piped',
      stderr: 'piped',
    })

    const cloneOutput = await cloneCommand.output()
    if (!cloneOutput.success) {
      const textDecoder = new TextDecoder()
      console.error(
        '❌ Failed to clone repository:',
        textDecoder.decode(cloneOutput.stderr),
      )
      return
    }

    // Check if .cursor folder exists in the cloned repository
    const cursorFolderPath = join(tempDir, '.cursor')
    try {
      await Deno.stat(cursorFolderPath)
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.error('❌ .cursor folder not found in the cloned repository')
        return
      }
      throw error
    }

    // Remove existing .cursor folder in the project if it exists
    const targetCursorFolder = './.cursor'
    try {
      await Deno.stat(targetCursorFolder)
      console.log('🗑️ Removing existing .cursor folder...')
      await emptyDir(targetCursorFolder)
      await Deno.remove(targetCursorFolder, { recursive: true })
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        console.error('⚠️ Error removing existing .cursor folder:', error)
      }
    }

    // Copy the .cursor folder from the cloned repo to the project root
    console.log('📂 Copying .cursor folder to project root...')
    const copyCommand = new Deno.Command('cp', {
      args: ['-r', cursorFolderPath, './'],
      stdout: 'piped',
      stderr: 'piped',
    })

    const copyOutput = await copyCommand.output()
    if (!copyOutput.success) {
      const textDecoder = new TextDecoder()
      console.error(
        '❌ Failed to copy .cursor folder:',
        textDecoder.decode(copyOutput.stderr),
      )
      return
    }

    console.log('✅ Successfully copied .cursor folder to project root')
  } catch (error) {
    console.error('❌ Error fetching and copying cursor configuration:', error)
  } finally {
    // Clean up - remove temporary directory
    try {
      await Deno.remove(tempDir, { recursive: true })
      console.log('🧹 Cleaned up temporary files')
    } catch (error) {
      console.error('⚠️ Error cleaning up temporary directory:', error)
    }
  }
}

// Run the script if it's the main module
if (import.meta.main) {
  await update()
}
