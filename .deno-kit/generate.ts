#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-env

import { basename, join } from "@std/path";

// Define the template placeholders and their corresponding values
export interface TemplateValues {
  PACKAGE_NAME: string;
  PACKAGE_SCOPE: string;
  PACKAGE_VERSION: string;
  PACKAGE_AUTHOR_NAME: string;
  PACKAGE_AUTHOR_EMAIL: string;
  PACKAGE_DESCRIPTION: string;
  YEAR: string;
  PROJECT_NAME: string;
  [key: string]: string; // Add index signature for string keys
}

// Template file mappings (source -> destination)
const templateMappings = {
  "@templates/README.template.md": "./README.md",
  "@templates/deno.template.jsonc": "./deno.jsonc",
  "@templates/CONTRIBUTING.template..MD": "./CONTRIBUTING.md", // Note the double dot
  "@templates/LICENSE.template": "./LICENSE",
};

/**
 * Gets the git user name from git config
 */
async function getGitUserName(): Promise<string> {
  try {
    const command = new Deno.Command("git", {
      args: ["config", "user.name"],
      stdout: "piped",
    });

    const { stdout } = await command.output();
    const decoder = new TextDecoder();
    return decoder.decode(stdout).trim();
  } catch (_error) {
    return "";
  }
}

/**
 * Gets the git user email from git config
 */
async function getGitUserEmail(): Promise<string> {
  try {
    const command = new Deno.Command("git", {
      args: ["config", "user.email"],
      stdout: "piped",
    });

    const { stdout } = await command.output();
    const decoder = new TextDecoder();
    return decoder.decode(stdout).trim();
  } catch (_error) {
    return "";
  }
}

/**
 * Prompts the user for input with a default value
 */
async function promptWithDefault(
  promptText: string,
  defaultValue: string,
): Promise<string> {
  const promptWithDefault = defaultValue
    ? `${promptText} (default: ${defaultValue}): `
    : `${promptText}: `;

  console.log(promptWithDefault);

  const buf = new Uint8Array(1024);
  const n = await Deno.stdin.read(buf);
  if (n === null) {
    return defaultValue;
  }

  const input = new TextDecoder().decode(buf.subarray(0, n)).trim();
  return input || defaultValue;
}

/**
 * Validates a package name to ensure it's in the format @scope/name
 */
function isValidPackageName(packageName: string): boolean {
  return /^@[a-z0-9-]+\/[a-z0-9-]+$/.test(packageName);
}

/**
 * Extracts the scope from a package name
 */
function extractScope(packageName: string): string {
  const match = packageName.match(/^(@[a-z0-9-]+)\/[a-z0-9-]+$/);
  return match ? match[1] : "";
}

/**
 * Extracts the project name from a package name (without scope)
 */
function extractProjectName(packageName: string): string {
  const match = packageName.match(/^@[a-z0-9-]+\/([a-z0-9-]+)$/);
  return match ? match[1] : packageName;
}

/**
 * Gathers all template values from user input
 */
export async function gatherTemplateValues(): Promise<TemplateValues> {
  // Get default values
  const defaultName = await getGitUserName();
  const defaultEmail = await getGitUserEmail();
  const currentYear = new Date().getFullYear().toString();

  // Prompt for package name with validation
  let packageName = "";
  do {
    packageName = await promptWithDefault(
      "Enter package name (format: @scope/name)",
      "@my-org/my-lib",
    );

    if (!isValidPackageName(packageName)) {
      console.error(
        "Invalid package name format. It must be in the format @scope/name (e.g., @deno/example)",
      );
    }
  } while (!isValidPackageName(packageName));

  // Extract scope and project name
  const packageScope = extractScope(packageName);
  const projectName = extractProjectName(packageName);

  // Gather remaining values
  const packageVersion = await promptWithDefault(
    "Enter package version",
    "0.0.1",
  );

  const authorName = await promptWithDefault(
    "Enter author name",
    defaultName,
  );

  const authorEmail = await promptWithDefault(
    "Enter author email",
    defaultEmail,
  );

  const packageDescription = await promptWithDefault(
    "Enter package description",
    "A Deno library",
  );

  return {
    PACKAGE_NAME: packageName,
    PACKAGE_SCOPE: packageScope,
    PACKAGE_VERSION: packageVersion,
    PACKAGE_AUTHOR_NAME: authorName,
    PACKAGE_AUTHOR_EMAIL: authorEmail,
    PACKAGE_DESCRIPTION: packageDescription,
    YEAR: currentYear,
    PROJECT_NAME: projectName,
  };
}

/**
 * Replaces all placeholders in a string with their values
 */
function replacePlaceholders(
  content: string,
  values: TemplateValues,
): string {
  return content.replace(
    /{([A-Z_]+)}/g,
    (_match, placeholder) =>
      placeholder in values ? values[placeholder] : _match,
  );
}

/**
 * Creates the templates backup directory if it doesn't exist
 */
export async function ensureTemplatesBackupDir(): Promise<void> {
  try {
    await Deno.mkdir("@templates", { recursive: true });
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}

/**
 * Backs up an existing file before overwriting it
 */
export async function backupExistingFile(filePath: string): Promise<boolean> {
  try {
    // Check if the file exists
    await Deno.stat(filePath);

    // Get file name
    const fileName = basename(filePath);
    const backupPath = join("@templates", `${fileName}.backup`);

    // Copy the file to backup location
    await Deno.copyFile(filePath, backupPath);
    console.log(`🔄 Backed up ${filePath} to ${backupPath}`);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // File doesn't exist, no backup needed
      return false;
    }
    console.error(`⚠️ Failed to backup ${filePath}:`, error);
    return false;
  }
}

/**
 * Processes a template file and writes it to the destination
 */
async function processTemplate(
  templatePath: string,
  destPath: string,
  values: TemplateValues,
): Promise<void> {
  try {
    // Ensure backup directory exists
    await ensureTemplatesBackupDir();

    // Backup existing file if it exists
    await backupExistingFile(destPath);

    // Read template file
    const content = await Deno.readTextFile(templatePath);

    // Replace placeholders
    const processedContent = replacePlaceholders(content, values);

    // Write to destination
    await Deno.writeTextFile(destPath, processedContent);

    console.log(`✅ Created ${destPath}`);
  } catch (error) {
    console.error(`❌ Error processing template ${templatePath}:`, error);
  }
}

/**
 * Processes the .env template file, only if .env doesn't exist
 */
async function processEnvTemplate(values: TemplateValues): Promise<void> {
  const templatePath = "@templates/.env.template";
  const destPath = "./.env";

  try {
    // Check if .env already exists
    try {
      await Deno.stat(destPath);
      // Backup existing .env file
      await ensureTemplatesBackupDir();
      await backupExistingFile(destPath);
      console.log(`ℹ️ ${destPath} already exists, backing up and overwriting`);
    } catch (_error) {
      // File doesn't exist, continue processing
    }

    // Process the template
    await processTemplate(templatePath, destPath, values);
  } catch (error) {
    console.error("❌ Error processing .env template:", error);
  }
}

/**
 * Runs deno install after template processing
 */
async function runDenoInstall(): Promise<void> {
  console.log("🦕 Running deno install...");

  try {
    const command = new Deno.Command("deno", {
      args: ["install"],
      stdout: "piped",
      stderr: "piped",
    });

    const { stdout, stderr } = await command.output();

    const textDecoder = new TextDecoder();
    console.log(textDecoder.decode(stdout));

    const stderrOutput = textDecoder.decode(stderr);
    if (stderrOutput) {
      console.error(stderrOutput);
    }

    console.log("✅ Deno install completed");
  } catch (error) {
    console.error("❌ Error running deno install:", error);
  }
}

/**
 * Main function for template generation
 */
export async function generate(): Promise<void> {
  console.log("🦕 Deno Library Template Generator");
  console.log("---------------------------------");

  // Gather all values from user input
  const templateValues = await gatherTemplateValues();

  console.log("\nℹ️ Using the following values:");
  console.table(templateValues);

  // Process all template files
  for (const [templatePath, destPath] of Object.entries(templateMappings)) {
    await processTemplate(templatePath, destPath, templateValues);
  }

  // Process .env template if needed
  await processEnvTemplate(templateValues);

  // Run deno install
  await runDenoInstall();

  console.log("\n🎉 All done! Your Deno library is ready to use.");
  console.log("📦 Package:", templateValues.PACKAGE_NAME);
}

// Run the script if it's the main module
if (import.meta.main) {
  await generate();
}
