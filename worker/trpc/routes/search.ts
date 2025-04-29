import { getSnippetsBySearchQuery } from "@worker/db/queries";
import { router, publicProcedure } from "../trpc";
import { z } from "zod";

export const searchRouter = router({
  search: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return await getSnippetsBySearchQuery(ctx.db, input);
  }),
});