// src/plugins/loader.ts
// Extracted from src/plugin.ts - Phase 3A (Extract)

import { readFile as fsReadFile, readdir as fsReaddir, stat as fsStat } from "fs/promises";
import * as path from "path";
import { CTDD_DIR } from "../core/constants.js";
import { CTDDError, ErrorCodes, PluginConfigError } from "../errors.js";
import { PluginDef, PluginSchema } from "./types.js";

const PluginDirName = "plugins";

async function listPluginFiles(root: string): Promise<string[]> {
  const dir = path.join(root, CTDD_DIR, PluginDirName);
  try {
    const st = await fsStat(dir);
    if (!st.isDirectory()) {
      console.warn(`[WARN] Plugin directory exists but is not a directory: ${dir}`);
      return [];
    }
  } catch (error: any) {
    // Expected when plugins directory doesn't exist
    if (error?.code !== 'ENOENT') {
      console.warn(`[WARN] Unexpected error accessing plugin directory ${dir}: ${error?.message}`);
    }
    return [];
  }

  try {
    const names = await fsReaddir(dir);
    return names
      .filter((n) => n.endsWith(".json"))
      .map((n) => path.join(dir, n));
  } catch (error: any) {
    throw new CTDDError(
      `Failed to read plugin directory: ${error?.message || 'Unknown error'}`,
      ErrorCodes.PLUGIN_LOAD_FAILED,
      { pluginDir: dir, originalError: error?.code },
      [
        'Check directory permissions',
        'Verify plugin directory is accessible',
        'Create plugins directory if missing'
      ]
    );
  }
}

export async function loadPlugins(root: string): Promise<PluginDef[]> {
  const files = await listPluginFiles(root);
  const out: PluginDef[] = [];
  const validationErrors: string[] = [];

  for (const f of files) {
    try {
      const raw = await fsReadFile(f, "utf-8");
      const json = JSON.parse(raw);
      const parsed = PluginSchema.safeParse(json);

      if (parsed.success) {
        out.push(parsed.data);
      } else {
        // Enhanced validation error with structured details
        const fileName = path.basename(f);
        const errorDetails = parsed.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
          expected: issue.code === 'invalid_union_discriminator' ? issue.options : undefined
        }));

        const errorMessage = `Invalid plugin ${fileName}: ${JSON.stringify(errorDetails, null, 2)}`;
        validationErrors.push(errorMessage);
        console.warn(errorMessage);
      }
    } catch (e) {
      const fileName = path.basename(f);
      const errorMessage = `Failed to load plugin ${fileName}: ${e instanceof Error ? e.message : 'Unknown error'}`;
      validationErrors.push(errorMessage);
      console.warn(errorMessage);
    }
  }

  // If there are validation errors, log them to error system
  if (validationErrors.length > 0) {
    const { logError } = await import('../core.js');
    await logError(
      root,
      new PluginConfigError(
        path.join(root, CTDD_DIR, PluginDirName),
        `Plugin validation failed for ${validationErrors.length} plugin(s): ${validationErrors.join('; ')}`
      ),
      'loadPlugins'
    );
  }

  return out;
}