// src/plugins/types.ts
// Extracted from src/plugin.ts - Phase 3A (Extract)

import { z } from "zod";

const BasePluginSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  report_as: z.string().optional(),
  relatedCuts: z.array(z.string()).optional(),
  relatedInvariants: z.array(z.string()).optional()
});

const GrepSchema = BasePluginSchema.extend({
  kind: z.literal("grep"),
  file: z.string(),
  pattern: z.string(),
  flags: z.string().optional().default(""),
  must_exist: z.boolean().optional().default(true)
});

const FileExistsSchema = BasePluginSchema.extend({
  kind: z.literal("file_exists"),
  file: z.string(),
  should_exist: z.boolean().optional().default(true)
});

const JsonPathSchema = BasePluginSchema.extend({
  kind: z.literal("jsonpath"),
  file: z.string(),
  path: z.string(), // JSONPath expression
  // If equals is provided, we pass when any result deep-equals this value.
  equals: z.any().optional(),
  // If equals is NOT provided, we use exists (default true) to assert presence.
  exists: z.boolean().optional().default(true)
});

const MultiGrepItemSchema = z.object({
  file: z.string(),
  pattern: z.string(),
  flags: z.string().optional().default(""),
  must_exist: z.boolean().optional().default(true),
  label: z.string().optional()
});

const MultiGrepSchema = BasePluginSchema.extend({
  kind: z.literal("multi_grep"),
  checks: z.array(MultiGrepItemSchema).min(1),
  // mode=all => PASS if all checks pass; mode=any => PASS if any passes
  mode: z.enum(["all", "any"]).optional().default("all")
});

const GlobEachGrepSchema = z.object({
  pattern: z.string(),
  flags: z.string().optional().default(""),
  must_exist: z.boolean().optional().default(true)
});

const GlobSchema = BasePluginSchema.extend({
  kind: z.literal("glob"),
  pattern: z.string(),
  ignore: z.array(z.string()).optional().default([]),
  dot: z.boolean().optional().default(false),
  // Count constraints on matched files
  min: z.number().optional().default(1),
  max: z.number().optional(),
  // Optional grep to apply to matched files
  each_grep: GlobEachGrepSchema.optional(),
  // If each_grep present: 'all' means every file must pass; 'any' at least one
  each_mode: z.enum(["all", "any"]).optional().default("all")
});

export const PluginSchema = z.discriminatedUnion("kind", [
  GrepSchema,
  FileExistsSchema,
  JsonPathSchema,
  MultiGrepSchema,
  GlobSchema
]);

export type PluginDef = z.infer<typeof PluginSchema>;

export type PluginResult = {
  id: string; // report_as || id
  plugin_id: string;
  title: string;
  status: "PASS" | "FAIL";
  evidence?: string;
  related_cuts?: string[];
  related_invariants?: string[];
};