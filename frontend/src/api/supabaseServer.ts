import { withSupabase } from "@supabase/server"

// The @supabase/server SDK reads environment variables automatically:
// - SUPABASE_URL
// - SUPABASE_PUBLISHABLE_KEY
// - SUPABASE_SECRET_KEY
// - SUPABASE_JWKS_URL

export const userAuthHandler = (handler: (req: Request, ctx: any) => Promise<Response>) => {
  return withSupabase({ auth: "user" }, handler)
}

export const adminAuthHandler = (handler: (req: Request, ctx: any) => Promise<Response>) => {
  return withSupabase({ auth: "secret" }, handler)
}

export const publicAuthHandler = (handler: (req: Request, ctx: any) => Promise<Response>) => {
  return withSupabase({ auth: "publishable" }, handler)
}

export default {
  withSupabase,
}
