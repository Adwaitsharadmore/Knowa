// /lib/org.ts
import { supabaseServer } from "@/utills/supabase/server";

export async function getUserDefaultOrgId() {
  const supabase = await supabaseServer();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) throw new Error("Unauthenticated");

  const { data, error } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error || !data) throw new Error("No org membership found");
  return data.org_id as string; // UUID
}
