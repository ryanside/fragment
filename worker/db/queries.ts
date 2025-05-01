import { drizzle } from "drizzle-orm/neon-http";
import { Folder, folders, snippets, snippetsInsertSchema } from "./schema";
import { and, eq, like } from "drizzle-orm";
import { z } from "zod";

// Define the input type for creating a snippet
export const createSnippetSchema = snippetsInsertSchema.omit({ id: true });
export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;

// Define the input type for updating a snippet (id is required, others optional, no createdAt/updatedAt)
export const updateSnippetSchema = snippetsInsertSchema.partial().required({ id: true, userId: true }).omit({ createdAt: true, updatedAt: true });
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;

export async function getSnippetById(db: ReturnType<typeof drizzle>, id: number, userId: string) {
  try {
    return await db.select().from(snippets).where(and(eq(snippets.id, id), eq(snippets.userId, userId)));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch snippet from database");
  }
}

export async function getSnippetsByFolderId(db: ReturnType<typeof drizzle>, folderId: number) {
  try {
    return await db.select().from(snippets).where(eq(snippets.folderId, folderId));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch folder's snippets from database");
  }
}

export async function getSnippets(db: ReturnType<typeof drizzle>, userId: string) {
  try {
    return await db.select().from(snippets).where(eq(snippets.userId, userId));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch snippets from database");
  }
}

export async function getPublicSnippet(db: ReturnType<typeof drizzle>, id: number) {
  try {
    return await db.select().from(snippets).where(and(eq(snippets.id, id), eq(snippets.visibility, "public")));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch public snippet from database");
  }
}

export async function getSnippetVisibility(db: ReturnType<typeof drizzle>, id: number) {
  try {
    const visibility = await db.select({visibility: snippets.visibility}).from(snippets).where(eq(snippets.id, id));
    if (visibility[0].visibility === "public") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch snippet visibility from database");
  }
}
export async function getSnippetsBySearchQuery(db: ReturnType<typeof drizzle>, searchQuery: string) {
  try {
    return await db.select().from(snippets).where(and(like(snippets.title, `%${searchQuery}%`), eq(snippets.visibility, "public")));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch snippets from database");
  }
}

export async function saveSnippet(db: ReturnType<typeof drizzle>, snippet: CreateSnippetInput) {
  try {
    return await db.insert(snippets).values(snippet).returning();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save snippet to database");
  }
}

export async function updateSnippet(db: ReturnType<typeof drizzle>, snippet: UpdateSnippetInput) {
  try {
    // Explicitly set updatedAt to the current time
    return await db.update(snippets)
      .set({ ...snippet, updatedAt: new Date() })
      .where(eq(snippets.id, snippet.id))
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update snippet in database");
  }
}

export async function deleteSnippet(db: ReturnType<typeof drizzle>, id: number) {
  try {
    return await db.delete(snippets).where(eq(snippets.id, id));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete snippet from database");
  }
} 

export async function getStarredSnippets(db: ReturnType<typeof drizzle>) {
  try {
    return await db.select().from(snippets).where(eq(snippets.starred, true));
  } catch (error) {
    console.error(error); 
    throw new Error("Failed to fetch starred snippets from database");
  }
}

export async function starSnippet(db: ReturnType<typeof drizzle>, id: number, starred: boolean) {
  try {
    return await db.update(snippets).set({ starred: starred }).where(eq(snippets.id, id));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to star snippet in database");
  }
}

export async function getFolders(db: ReturnType<typeof drizzle>, userId: string) {
  try {
    return await db.select().from(folders).where(eq(folders.userId, userId));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch folders from database");
  }
}

export async function getFolderById(db: ReturnType<typeof drizzle>, id: number) {
  try {
    return await db.select().from(folders).where(eq(folders.id, id));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch folder from database");
  }
}

export async function getFoldersByParentId(db: ReturnType<typeof drizzle>, parentId: number) {
  try {
    return await db.select().from(folders).where(eq(folders.parentId, parentId));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch folder's folders from database");
  }
}

export async function saveFolder(db: ReturnType<typeof drizzle>, folder: Folder) {
  try {
    return await db.insert(folders).values(folder);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save folder to database");
  }
}

export async function updateFolder(db: ReturnType<typeof drizzle>, folder: Folder) {
  try { 
    return await db.update(folders).set(folder).where(eq(folders.id, folder.id))
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update folder in database");
  }
}

export async function deleteFolder(db: ReturnType<typeof drizzle>, id: number) {
  try {
    return await db.delete(folders).where(eq(folders.id, id));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete folder from database");
  }
}


