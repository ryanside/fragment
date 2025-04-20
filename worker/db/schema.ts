import { pgTable, serial, text, doublePrecision } from 'drizzle-orm/pg-core';
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { InferSelectModel } from "drizzle-orm";

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  price: doublePrecision('price'),
});

export type Product = InferSelectModel<typeof products>;
export const productInsertSchema = createInsertSchema(products);
export const productSelectSchema = createSelectSchema(products);
