import {
  pgTable,
  text,
  integer,
  timestamp,
  PgColumn,
  boolean,
  serial,
  varchar,
  json,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { InferSelectModel } from "drizzle-orm";

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("untitled"),
  visibility: text("visibility").notNull().default("private"),
  description: text("description"),
  parentId: integer("parent_id").references((): PgColumn => folders.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Folder = InferSelectModel<typeof folders>;
export const folderInsertSchema = createInsertSchema(folders);
export const folderSelectSchema = createSelectSchema(folders);

export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("untitled"),
  visibility: text("visibility").notNull().default("private"),
  language: text("language").notNull().default("plaintext"),
  description: text("description"),
  content: text("content").notNull(),
  folderId: integer("folder_id").references((): PgColumn => folders.id, {
    onDelete: "cascade",
  }),
  tags: text("tags").array(),
  starred: boolean("starred").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Snippet = InferSelectModel<typeof snippets>;
export const snippetsInsertSchema = createInsertSchema(snippets);
export const snippetsSelectSchema = createSelectSchema(snippets);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
 
export const roles = pgTable("roles", {
	userId: varchar("userId", { length: 256 }).primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	canDelete: boolean("canDelete").notNull(),
});
 
export const comments = pgTable("comments", {
	id: serial("id").primaryKey().notNull(),
	page: varchar("page", { length: 256 }).notNull(),
	thread: integer("thread"),
	author: varchar("author", { length: 256 }).notNull(),
	content: json("content").notNull(),
	timestamp: timestamp("timestamp", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
 
export const rates = pgTable(
	"rates",
	{
		userId: varchar("userId", { length: 256 }).notNull(),
		commentId: integer("commentId").notNull(),
		like: boolean("like").notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.commentId] }),
		index("comment_idx").on(table.commentId),
	],
);

export const schema = {
  folders,
  snippets,
  user,
  session,
  account,
  verification,
  roles,
  comments,
  rates,
};
