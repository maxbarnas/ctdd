// src/server.ts
// Phase 3: Server Integration - using extracted server modules

import express from "express";
import { corsAll, ServerOptions } from "./server/middleware.js";
import { setupRoutes } from "./server/routes.js";

export async function startServer(opts: ServerOptions) {
  const app = express();
  const root = opts.root;
  const port = opts.port ?? 4848;

  app.use(express.json({ limit: "1mb" }));
  app.use(corsAll);

  // Setup all routes using extracted route handlers
  setupRoutes(app, root);

  app.listen(port, () => {
    console.log(`CTDD server listening on http://localhost:${port}`);
  });
}