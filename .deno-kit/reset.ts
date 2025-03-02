#!/usr/bin/env -S deno run --allow-read --allow-write

import { basename, join } from "@std/path";

/**
 * Restores all backup files to their original locations
 */
export async function reset(): Promise<void> {
  console.log("🔄 Restoring backup files...");

  try {
    // Ensure @templates directory exists
    try {
      await Deno.stat("@templates");
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log("❓ No backup directory found. Nothing to restore.");
        return;
      }
      throw error;
    }

    // Get all files in the @templates directory
    const templatesDir = await Deno.readDir("@templates");
    let restoredCount = 0;

    // Process each file
    for await (const entry of templatesDir) {
      if (entry.isFile && entry.name.endsWith(".backup")) {
        // Get original filename (remove .backup suffix)
        const originalFilename = entry.name.slice(0, -7); // Remove '.backup'
        const backupPath = join("@templates", entry.name);
        const targetPath = `./${originalFilename}`;

        try {
          // Copy backup to original location
          await Deno.copyFile(backupPath, targetPath);
          console.log(`✅ Restored ${targetPath} from ${backupPath}`);
          restoredCount++;
        } catch (error) {
          console.error(`❌ Failed to restore ${targetPath}:`, error);
        }
      }
    }

    if (restoredCount === 0) {
      console.log("❓ No backup files found to restore.");
    } else {
      console.log(`🎉 Restored ${restoredCount} file(s) from backups.`);
    }
  } catch (error) {
    console.error("❌ Error restoring backup files:", error);
  }
}

// Run the script if it's the main module
if (import.meta.main) {
  await reset();
}
