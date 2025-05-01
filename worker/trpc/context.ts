import { drizzle } from "drizzle-orm/neon-http";
import { ExecutionContext } from "hono";

export type Bindings = {
  DATABASE_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  // Add other environment variables here if needed
};

export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  // Type env directly as Bindings
  env: Bindings;
  workerCtx: ExecutionContext;
}) {
  // Create db instance using env variable
  const db = drizzle(env.DATABASE_URL);
  return {
    req,
    env,
    workerCtx,
    db, // Add db to context
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
