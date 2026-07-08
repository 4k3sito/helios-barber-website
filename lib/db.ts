import { createClient } from "@supabase/supabase-js"

// Server-only client — SUPABASE_API_KEY must be the service_role key (bypasses RLS),
// never the anon key, since this runs in API routes with no user session.
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!)
