import { pgTable, text, integer, timestamp, PgColumn, boolean, serial } from 'drizzle-orm/pg-core';
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { InferSelectModel } from "drizzle-orm";


export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("untitled"),
  visibility: text("visibility").notNull().default("private"),
  description: text("description"),
  parentId: integer("parent_id").references((): PgColumn => folders.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Folder = InferSelectModel<typeof folders>;
export const folderInsertSchema = createInsertSchema(folders);
export const folderSelectSchema = createSelectSchema(folders);

export const snippets = pgTable("snippets", {
  id: serial('id').primaryKey(),
  title: text("title").notNull().default("untitled"),
  visibility: text("visibility").notNull().default("private"),
  language: text("language").notNull().default("plaintext"),
  description: text("description"),
  content: text("content").notNull(),
  folderId: integer("folder_id").references((): PgColumn => folders.id),
  tags: text("tags").array(),
  starred: boolean("starred").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Snippet = InferSelectModel<typeof snippets>;
export const snippetsInsertSchema = createInsertSchema(snippets);
export const snippetsSelectSchema = createSelectSchema(snippets);


