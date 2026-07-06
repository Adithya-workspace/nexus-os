import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

/**
 * Auth configuration.
 *
 * - Google: real OAuth login. Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
 *   in .env.local (see .env.example). Until those are set, the Google button
 *   will show a configuration error from NextAuth rather than silently fail.
 * - Guest / Demo: fully functional zero-friction logins for hackathon demos —
 *   no external service required.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {},
      authorize: async () => ({ id: "guest", name: "Guest User", email: "guest@nexusos.ai" }),
    }),
    Credentials({
      id: "demo",
      name: "Demo",
      credentials: {},
      authorize: async () => ({ id: "demo", name: "Demo Owner", email: "demo@nexusos.ai" }),
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
