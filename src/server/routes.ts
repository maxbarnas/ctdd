// src/server/routes.ts
// Phase 3: Server Routes - All HTTP route handlers

import express from "express";
import {
  ensureProjectDirs,
  initProject,
  loadSpec,
  loadState,
  computeCommitId,
  renderPrePrompt,
  renderPostPrompt,
  renderAgentBrief,
  renderAgentBriefJson,
  recordEvent,
  applyDeltaObject,
  PreResponseSchema,
  PostResponseSchema,
  logError
} from "../core.js";
import { runPlugins, checksToPostChecks, loadPlugins } from "../plugin.js";
import { CTDDError } from "../errors.js";
import { getUITemplate } from "./ui.js";

export function setupRoutes(app: express.Application, root: string) {
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/init", async (_req, res) => {
    try {
      await ensureProjectDirs(root);
      const { commitId } = await initProject(root);
      res.json({ ok: true, commit_id: commitId });
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'POST /init');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.get("/status", async (_req, res) => {
    try {
      const spec = await loadSpec(root);
      const commitId = computeCommitId(spec);
      const state = (await loadState(root)) ?? {
        commit_id: commitId,
        history: []
      };
      res.json({ ok: true, commit_id: commitId, spec, state });
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.get("/pre-prompt", async (_req, res) => {
    try {
      const spec = await loadSpec(root);
      const commitId = computeCommitId(spec);
      const prompt = renderPrePrompt(spec, commitId);
      res.type("text/plain").send(prompt);
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.post("/post-prompt", async (req, res) => {
    try {
      const artifact: string | undefined = req.body?.artifact;
      const spec = await loadSpec(root);
      const commitId = computeCommitId(spec);
      const prompt = renderPostPrompt(spec, commitId, artifact);
      res.type("text/plain").send(prompt);
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.post("/pre-response", async (req, res) => {
    try {
      const data = PreResponseSchema.parse(req.body);
      const spec = await loadSpec(root);
      const commitId = computeCommitId(spec);
      if (data.commit_id !== commitId) {
        return res.status(409).json({
          ok: false,
          error: `Commit mismatch. Expected ${commitId}, got ${data.commit_id}.`
        });
      }
      const state = await recordEvent(root, "pre", data);
      res.json({ ok: true, commit_id: state.commit_id });
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.get("/brief", async (req, res) => {
    try {
      const spec = await loadSpec(root);
      const commitId = computeCommitId(spec);
      const qp = req.query as any;
      const includePlugins =
        !qp ||
        !("plugins" in qp) ||
        !["0", "false", "no"].includes(String(qp.plugins).toLowerCase());
      let pluginsInfo: any[] | undefined;
      if (includePlugins) {
        const defs = await loadPlugins(root);
        pluginsInfo = defs.map((d: any) => {
          const base: any = {
            id: d.id,
            kind: d.kind,
            title: d.title,
            report_as: d.report_as,
            relatedCuts: d.relatedCuts,
            relatedInvariants: d.relatedInvariants
          };
          return { ...base, ...d };
        });
      }
      const md = renderAgentBrief(spec, commitId, pluginsInfo);
      res.type("text/markdown").send(md);
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.get("/brief.json", async (req, res) => {
    try {
      const spec = await loadSpec(root);
      const commitId = computeCommitId(spec);
      const qp = req.query as any;
      const includePlugins =
        !qp ||
        !("plugins" in qp) ||
        !["0", "false", "no"].includes(String(qp.plugins).toLowerCase());
      let pluginsInfo: any[] | undefined;
      if (includePlugins) {
        const defs = await loadPlugins(root);
        pluginsInfo = defs.map((d: any) => {
          const base: any = {
            id: d.id,
            kind: d.kind,
            title: d.title,
            report_as: d.report_as,
            relatedCuts: d.relatedCuts,
            relatedInvariants: d.relatedInvariants
          };
          return { ...base, ...d };
        });
      }
      const json = renderAgentBriefJson(spec, commitId, pluginsInfo);
      res.json(json);
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.get("/ui", async (_req, res) => {
    const html = getUITemplate();
    res.type("text/html").send(html);
  });

  app.post("/post-response", async (req, res) => {
    try {
      const data = PostResponseSchema.parse(req.body);
      const spec = await loadSpec(root);
      const commitId = computeCommitId(spec);
      if (data.commit_id !== commitId) {
        return res.status(409).json({
          ok: false,
          error: `Commit mismatch. Expected ${commitId}, got ${data.commit_id}.`
        });
      }

      // Run plugin checks and merge into post_check
      const results = await runPlugins(root);
      const postChecks = checksToPostChecks(results);
      const merged = {
        ...data,
        post_check: [...data.post_check, ...postChecks]
      };

      const state = await recordEvent(root, "post", merged);
      res.json({
        ok: true,
        commit_id: state.commit_id,
        plugin_checks: results
      });
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.get("/checks", async (_req, res) => {
    try {
      const results = await runPlugins(root);
      res.json({ ok: true, checks: results });
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });

  app.post("/delta", async (req, res) => {
    try {
      const delta = req.body;
      const { newCommitId } = await applyDeltaObject(root, delta);
      res.json({ ok: true, commit_id: newCommitId });
    } catch (e: any) {
      // Log error to structured log
      try {
        await logError(root, e, 'server-endpoint');
      } catch (logErr) {
        console.error('Failed to log error:', logErr);
      }

      const errorMessage = e instanceof CTDDError ? e.toString() : String(e?.message ?? e);
      res.status(400).json({ ok: false, error: errorMessage });
    }
  });
}