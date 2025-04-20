import { router } from "./trpc";
import { productsRouter } from "./routes/products";

export const appRouter = router({
  products: productsRouter,
});

export type AppRouter = typeof appRouter;
