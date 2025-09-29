// src/schemas/spec.ts
// Extracted from src/core.ts - Phase 2A (Extract)

import { z } from "zod";

export const FocusCardSchema = z.object({
  focus_card_id: z.string(),
  title: z.string(),
  goal: z.string(),
  deliverables: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  non_goals: z.array(z.string()).default([]),
  sources_of_truth: z.array(z.string()).default([]),
  token_budget: z.number().optional()
});

export const InvariantSchema = z.object({
  id: z.string(),
  text: z.string()
});

export const CutSchema = z.object({
  id: z.string(),
  text: z.string(),
  examples: z.array(z.string()).optional()
});

export const SpecSchema = z.object({
  focus_card: FocusCardSchema,
  invariants: z.array(InvariantSchema),
  cuts: z.array(CutSchema)
});

// Derived types
export type FocusCard = z.infer<typeof FocusCardSchema>;
export type Invariant = z.infer<typeof InvariantSchema>;
export type Cut = z.infer<typeof CutSchema>;
export type Spec = z.infer<typeof SpecSchema>;