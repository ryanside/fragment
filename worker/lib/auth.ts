import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/neon-http";
import { schema } from "@worker/db/schema";

// to generate the better auth schema:
// import { config } from "dotenv";
// config({ path: ".dev.vars" });
// const db = drizzle(process.env.DATABASE_URL!);
// export const auth = betterAuth({
//   database: drizzleAdapter(db, {
//     provider: "pg", // or "mysql", "sqlite"
//     schema: {
//       ...schema,
//     },
//   }),
//   trustedOrigins: [process.env.BETTER_AUTH_URL!],
//   emailAndPassword: {
//     enabled: true,
//   },
//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     },
//   },
// });

export function initializeBetterAuth(
  databaseUrl: string,
  clientId: string,
  clientSecret: string,
  betterAuthUrl: string
) {
  const db = drizzle(databaseUrl);
  const auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg", // or "mysql", "sqlite"
      schema: {
        ...schema,
      },
    }),
    trustedOrigins: [betterAuthUrl],
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: clientId,
        clientSecret: clientSecret,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache duration in seconds
      },
    },
  });
  return auth;
}
