import { createClient } from "@supabase/supabase-js";

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
    legacyAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  };
}

export function hasSupabaseConfig() {
  const { url, publishableKey, legacyAnonKey } = getSupabaseConfig();
  const key = publishableKey || legacyAnonKey;
  return Boolean(
    url
      && key
      && !url.includes("your-project")
      && !key.includes("your-publishable-key")
      && !key.includes("your-anon-key")
  );
}

export function createSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) return null;
  const { url, publishableKey, legacyAnonKey } = getSupabaseConfig();
  return createClient(url, publishableKey || legacyAnonKey);
}
