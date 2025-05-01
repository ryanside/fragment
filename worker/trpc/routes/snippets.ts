import { router, publicProcedure } from "@worker/trpc/trpc";
import {
  saveSnippet,
  getSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  starSnippet,
  getStarredSnippets,
  getPublicSnippet,
  getSnippetVisibility,
} from "@worker/db/queries";
import { z } from "zod";
import { snippetsInsertSchema, snippetsSelectSchema } from "@worker/db/schema";

// Create a specific schema for the create input, omitting the 'id'
const createSnippetInputSchema = snippetsInsertSchema.omit({ id: true });

// For update, use the select schema but omit createdAt and updatedAt
const updateSnippetInputSchema = snippetsSelectSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export const snippetsRouter = router({
  create: publicProcedure
    .input(createSnippetInputSchema)
    .mutation(async ({ input, ctx }) => {
      // No need to cast to Snippet anymore, input type matches saveSnippet expectation
      const snippet = await saveSnippet(ctx.db, input);
      return snippet;
    }),
  getById: publicProcedure
    .input(z.object({ id: z.number(), userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const snippet = await getSnippetById(ctx.db, input.id, input.userId);
      return snippet;
    }),
  getAll: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const snippets = await getSnippets(ctx.db, input);
    return snippets;
  }),
  getPublic: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
    const snippet = await getPublicSnippet(ctx.db, input);
    return snippet[0];
  }),
  getVisibility: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      const visibility = await getSnippetVisibility(ctx.db, input);
      return visibility;
    }),
  getStarred: publicProcedure.query(async ({ ctx }) => {
    const snippets = await getStarredSnippets(ctx.db);
    return snippets;
  }),
  update: publicProcedure
    .input(updateSnippetInputSchema)
    .mutation(async ({ input, ctx }) => {
      // Input type now matches updateSnippet expectation (partial Snippet, id required)
      const snippet = await updateSnippet(ctx.db, input);
      return snippet;
    }),
  delete: publicProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    const snippet = await deleteSnippet(ctx.db, input);
    return snippet;
  }),
  star: publicProcedure
    .input(z.object({ id: z.number(), starred: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const snippet = await starSnippet(ctx.db, input.id, input.starred);
      return snippet;
    }),
});
