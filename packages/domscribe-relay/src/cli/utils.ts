/**
 * CLI utility functions
 * @module @domscribe/relay/cli/utils
 */
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';

/**
 * Locate the workspace root by walking up from cwd looking for a `.domscribe` directory.
 */
export function getWorkspaceRoot(): string | undefined {
  // Check if .domscribe directory exists
  const cwd = process.cwd();
  const domscribeDir = path.join(cwd, '.domscribe');

  if (existsSync(domscribeDir)) {
    return cwd;
  }

  // Walk up to find .domscribe directory
  return walkUpToFindDomscribe(cwd);
}

function walkUpToFindDomscribe(startPath: string): string | undefined {
  let dir = path.resolve(startPath);

  // Handle if startPath is a file
  if (!statSync(dir).isDirectory()) {
    dir = path.dirname(dir);
  }

  while (true) {
    if (existsSync(path.join(dir, '.domscribe'))) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      // Hit filesystem root
      return;
    }
    dir = parent;
  }
}
