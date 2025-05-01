import { Hono } from "hono";
import { logger } from "hono/logger";
import { csrf } from "hono/csrf";
import { initializeBetterAuth } from "@worker/lib/auth";
import { Bindings } from "../trpc/context";
import { User, Session } from "better-auth";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { stream } from "hono/streaming";

export type Variables = {
  user: User | null;
  session: Session | null;
};

export const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use(logger());
app.use(csrf());

app.post("/api/chat", async (c) => {
  const req = await c.req.json();
  const message = req.messages[0].content;
  console.log(message);


  const result = streamText({
    maxTokens: 1000,
    model: google("gemini-2.0-flash"),
    system: `You are an AI assistant, powered by the Gemini 2.5 Pro model, specializing in code analysis and explanation.

Your primary function is to receive a code snippet from the user and provide a concise understanding of it.

When presented with a code snippet, you MUST respond with the following two distinct sections:

1.  **Concise Code Explanation:**
    *   Begin by stating the primary purpose or function of the code snippet in one or two sentences.
    *   Provide a brief overview of the code's main logic and functionality. Focus on the core steps, not exhaustive detail.
    *   If the snippet defines functions, classes, or variables, briefly explain their main roles and purpose. Mention parameters and return values succinctly.
    *   Identify the language the code is written in, if possible.
    *   Highlight only the most essential algorithms, patterns, or concepts used. Keep it brief.

2.  **Example Usage:**
    *   Provide a clear, complete, and practical example demonstrating how the provided code snippet can be effectively used.
    *   This example should be runnable (or easily adaptable to be runnable) and showcase a common or illustrative use case.
    *   Include any necessary setup or context (like imports or variable initializations) required for the example to work.
    *   Briefly explain what the example code does and why it demonstrates the original snippet's usage.

**Formatting Requirements:**
*   Use Markdown for all code, including brief mentions in the explanation and the full example usage block.
*   Ensure the explanation is direct, to the point, and easy to grasp quickly.
*   The example should be well-commented if necessary for clarity, but keep comments concise.

Your goal is to provide the user with a quick understanding of the provided code's purpose and demonstrate how to use it effectively.
`,
    prompt: message,
  });

  // Mark the response as a v1 data stream:
  c.header("X-Vercel-AI-Data-Stream", "v1");
  c.header("Content-Type", "text/plain; charset=utf-8");

  return stream(c, (stream) => stream.pipe(result.toDataStream()));
});

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

  // console.log(session);

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
