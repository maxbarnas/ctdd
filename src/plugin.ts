// src/plugin.ts
// Phase 3B: Integration - using extracted plugin modules

import { PluginDef, PluginResult } from "./plugins/types.js";
import { loadPlugins } from "./plugins/loader.js";
import { runPlugins, withTimeout, checksToPostChecks } from "./plugins/executor.js";

// Re-export for compatibility with existing imports
export { PluginDef, PluginResult } from "./plugins/types.js";
export { loadPlugins } from "./plugins/loader.js";
export { runPlugins, withTimeout, checksToPostChecks } from "./plugins/executor.js";