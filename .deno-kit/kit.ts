/**
 * This script serves as an entry point for the Deno application.
 * It forwards all arguments to the main.ts script.
 */

// Get the current Deno executable path
const denoExecutable = Deno.execPath()

// Create a command to run main.ts with the same arguments
const command = new Deno.Command(denoExecutable, {
  args: [
    'run',
    '--allow-all',
    '.deno-kit/main.ts',
    ...Deno.args,
  ],
  stdout: 'inherit',
  stderr: 'inherit',
})
console.log('command', command)
console.log('.deno-kit/main.ts')
let process: Deno.ChildProcess | undefined = undefined
try {
  // Spawn the process
  process = command.spawn()
} catch (err) {
  console.error(
    `Error running command: ${
      err instanceof Error ? err.message : String(err)
    }`,
  )
}

// Set up signal handlers to propagate signals to child process
function setupSignalHandlers(): () => void {
  // Define the signals we want to handle
  const signals: Deno.Signal[] = ['SIGINT', 'SIGTERM', 'SIGHUP']

  type SignalHandler = {
    signal: Deno.Signal
    handler: () => void
  }

  const handlers: SignalHandler[] = []

  // Set up handlers for each signal
  for (const signal of signals) {
    const handler = () => {
      console.log(`\nReceived ${signal}, shutting down gracefully...`)
      // The child process will receive the signal automatically
      // when the parent process receives it
    }

    Deno.addSignalListener(signal, handler)
    handlers.push({ signal, handler })
  }

  // Return a cleanup function to remove signal handlers
  return () => {
    for (const { signal, handler } of handlers) {
      try {
        Deno.removeSignalListener(signal, handler)
      } catch (_) {
        // Ignore errors when removing signal handlers
      }
    }
  }
}

// Setup signal handlers
const cleanupSignalHandlers = setupSignalHandlers()

try {
  // Wait for the process to complete
  const status = await process?.status
  if (!status) {
    throw new Error('Process not found')
  }

  // Clean up signal handlers
  cleanupSignalHandlers()

  // Exit with the same code as the child process
  Deno.exit(status?.code)
} catch (err) {
  console.error(
    `Error running command: ${
      err instanceof Error ? err.message : String(err)
    }`,
  )

  // Clean up signal handlers
  cleanupSignalHandlers()

  // Exit with error code
  Deno.exit(1)
}
