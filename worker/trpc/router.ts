import { router } from "./trpc";
import { snippetsRouter } from "./routes/snippets";
import { foldersRouter } from "./routes/folders";
import { searchRouter } from "./routes/search";

export const appRouter = router({
  snippets: snippetsRouter,
  folders: foldersRouter,
  search: searchRouter,
});

export type AppRouter = typeof appRouter;
