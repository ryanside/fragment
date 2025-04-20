import { drizzle } from "drizzle-orm/neon-http";
import { products } from "./schema";

// This needs to be initialized differently, likely within a function or passed in
// const db = drizzle(process.env.DATABASE_URL!);

export async function getProducts(db: ReturnType<typeof drizzle>) {
  try {
    return await db.select().from(products);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch products from database");
  }
}
