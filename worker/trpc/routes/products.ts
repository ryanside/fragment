import { router, publicProcedure } from "@worker/trpc/trpc";
import { getProducts } from "@worker/db/queries";
export const productsRouter = router({
  getProducts: publicProcedure.query(async ({ ctx }) => {
    return await getProducts(ctx.db);
  }),
});