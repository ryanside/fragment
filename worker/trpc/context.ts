import { drizzle } from "drizzle-orm/neon-http";
import { ExecutionContext } from "hono";

// Define the type for your environment variables
type Bindings = {
  DATABASE_URL: string;
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
