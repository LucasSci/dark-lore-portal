import { createClient } from "npm:@supabase/supabase-js@2";

function getEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getAnonLikeKey() {
  return (
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_ANON_PUBLIC_KEY") ??
    ""
  );
}

export function createUserClient(req: Request) {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const supabaseKey = getAnonLikeKey();

  if (!supabaseKey) {
    throw new Error("Missing Supabase anon/publishable key for Edge Functions.");
  }

  const authorization = req.headers.get("Authorization");

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: authorization
      ? {
          headers: {
            Authorization: authorization,
          },
        }
      : undefined,
  });
}

export function createAdminClient() {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
