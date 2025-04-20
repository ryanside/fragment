import { drizzle } from "drizzle-orm/neon-http";

export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  env: Env;
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
