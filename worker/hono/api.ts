import { Hono } from "hono";
import { logger } from "hono/logger";
import { csrf } from "hono/csrf";
import { initializeBetterAuth } from "@worker/lib/auth";
import { Bindings } from "../trpc/context";
import { User, Session } from "better-auth"

export type Variables = {
  user: User | null;
  session: Session | null;
}

export const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

app.use(logger());
app.use(csrf());

app.use("*", async (c, next) => {
  const auth = initializeBetterAuth(
    c.env.DATABASE_URL!,
    c.env.GOOGLE_CLIENT_ID!,
    c.env.GOOGLE_CLIENT_SECRET!,
    c.env.BETTER_AUTH_URL!
  );
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  console.log(session);

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = initializeBetterAuth(
    c.env.DATABASE_URL!,
    c.env.GOOGLE_CLIENT_ID!,
    c.env.GOOGLE_CLIENT_SECRET!,
    c.env.BETTER_AUTH_URL!
  );
  return auth.handler(c.req.raw);
});

app.get("/api/", (c) => {
  return c.json({
    name: "Cloudflare (with Hono)",
  });
});
