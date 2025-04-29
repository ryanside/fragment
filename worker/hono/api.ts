import { Hono } from "hono";
import { logger } from "hono/logger";
import { csrf } from "hono/csrf";

export const app = new Hono<{ Bindings: Env }>();

app.use(logger());
app.use(csrf());

app.get("/api/", (c) => {
  return c.json({
    name: "Cloudflare (with Hono)",
  });
});