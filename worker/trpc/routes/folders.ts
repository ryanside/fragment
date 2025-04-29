import { router, publicProcedure } from "@worker/trpc/trpc";
import { getFolderById, getFolders, saveFolder, updateFolder, getFoldersByParentId, deleteFolder, getSnippetsByFolderId } from "@worker/db/queries";
import { z } from "zod";
import { Folder, folderInsertSchema } from "@worker/db/schema";

export const foldersRouter = router({
    create: publicProcedure.input(folderInsertSchema).mutation(async ({ input, ctx }) => {
        const folder = await saveFolder(ctx.db, input as Folder);
        return folder;
    }),
    getAll: publicProcedure.query(async ({ ctx }) => {
        const folders = await getFolders(ctx.db);
        return folders;
    }),
    getById: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
        const folder = await getFolderById(ctx.db, input);
        return folder;
    }),
    getSnippetsByFolderId: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
        const snippets = await getSnippetsByFolderId(ctx.db, input);
        return snippets;
    }),
    update: publicProcedure.input(folderInsertSchema).mutation(async ({ input, ctx }) => {
        const folder = await updateFolder(ctx.db, input as Folder);
        return folder;
    }),
    getFoldersByParentId: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
        const folders = await getFoldersByParentId(ctx.db, input);
        return folders;
    }),
    delete: publicProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
        const folder = await deleteFolder(ctx.db, input);
        return folder;
    }),
})
