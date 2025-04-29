import { router } from "./trpc";
import { snippetsRouter } from "./routes/snippets";
import { foldersRouter } from "./routes/folders";
export const appRouter = router({
  snippets: snippetsRouter,
  folders: foldersRouter,
});

export type AppRouter = typeof appRouter;
