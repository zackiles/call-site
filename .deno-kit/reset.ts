#!/usr/bin/env -S deno run --allow-all

import { join } from '@std/path'
import { getConfig } from './config.ts'

// Get configuration to access kitDir and templatesDir
const config = await getConfig()

/**
 * Restores all backup files to their original locations and then removes the backup files
 */
async function reset(): Promise<void> {
  console.log('🔄 Restoring backup files...')

  try {
    // Ensure templates directory exists
    try {
      await Deno.stat(config.templatesDir)
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log('❓ No backup directory found. Nothing to restore.')
        return
      }
      throw error
    }

    // Get all files in the templates directory
    const templateFiles = await Deno.readDir(config.templatesDir)
    let restoredCount = 0
    const backupFiles: string[] = []

    // Process each file
    for await (const entry of templateFiles) {
      if (entry.isFile && entry.name.endsWith('.backup')) {
        // Get original filename (remove .backup suffix)
        const originalFilename = entry.name.slice(0, -7) // Remove '.backup'
        const backupPath = join(config.templatesDir, entry.name)
        const targetPath = `./${originalFilename}`

        try {
          // Copy backup to original location
          await Deno.copyFile(backupPath, targetPath)
          console.log(`✅ Restored ${targetPath} from ${backupPath}`)
          restoredCount++
          backupFiles.push(backupPath)
        } catch (error) {
          console.error(`❌ Failed to restore ${targetPath}:`, error)
        }
      }
    }

    if (restoredCount === 0) {
      console.log('❓ No backup files found to restore.')
    } else {
      console.log(`🎉 Restored ${restoredCount} file(s) from backups.`)
      
      // Remove backup files after successful restoration
      console.log('🧹 Removing backup files...')
      let removedCount = 0
      
      for (const backupFile of backupFiles) {
        try {
          await Deno.remove(backupFile)
          console.log(`🗑️ Removed ${backupFile}`)
          removedCount++
        } catch (error) {
          console.error(`❌ Failed to remove ${backupFile}:`, error)
        }
      }
      
      console.log(`🎉 Removed ${removedCount} backup file(s).`)
    }
  } catch (error) {
    console.error('❌ Error restoring backup files:', error)
  }
}

// Run the script if it's the main module
if (import.meta.main) {
  await reset()
}

// Export the function at the bottom of the file
export { reset } 
