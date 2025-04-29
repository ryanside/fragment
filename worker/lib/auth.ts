import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/neon-http";
// import { config } from "dotenv";

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
    }),
    trustedOrigins: [betterAuthUrl],
    socialProviders: {
      google: {
        clientId: clientId,
        clientSecret: clientSecret,
      },
    },
  });
  return auth;
}

// config({ path: ".dev.vars" });

// const db = drizzle(process.env.DATABASE_URL!);

// export const auth = betterAuth({
//   database: drizzleAdapter(db, {
//     provider: "pg", // or "mysql", "sqlite"
//   }),
//   trustedOrigins: [process.env.BETTER_AUTH_URL!],
//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     },
//   },
// });
