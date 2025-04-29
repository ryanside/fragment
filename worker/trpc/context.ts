import { drizzle } from "drizzle-orm/neon-http";
import { ExecutionContext } from "hono";
import { initializeBetterAuth } from "../lib/auth";
import { Auth } from "better-auth";

// Define the type for your environment variables
export type Bindings = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
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
  auth: Auth;
}) {
  // Create db instance using env variable
  const db = drizzle(env.DATABASE_URL);
  const auth = initializeBetterAuth(
    env.DATABASE_URL,
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.BETTER_AUTH_URL
  );

  return {
    req,
    env,
    workerCtx,
    db, // Add db to context
    auth,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
