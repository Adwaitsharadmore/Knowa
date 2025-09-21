// /lib/org.ts
import { supabaseServer } from "@/lib/supabase-server";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
    // Define public routes that don't require authentication
    const publicRoutes = [
      "/",                    // Home page
      "/auth/login",          // Login page
      "/auth/signup",         // Signup page
      "/api/health",          // Health check endpoint
    ];
  
    // Define static/public assets that should be accessible
    const isStaticAsset = request.nextUrl.pathname.startsWith("/_next/") ||
                         request.nextUrl.pathname.startsWith("/favicon") ||
                         request.nextUrl.pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/);
  
    // Allow static assets and public routes
    if (isStaticAsset || publicRoutes.includes(request.nextUrl.pathname)) {
      // If user is authenticated and trying to access auth pages, redirect to dashboard
      if (user && (request.nextUrl.pathname.startsWith("/auth"))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }
  
    // For all other routes, require authentication
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  
    return supabaseResponse;
  }
// Get all organizations for a user
export async function getUserOrganizations() {
  const supabase = await supabaseServer();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) throw new Error("Unauthenticated");

  const { data, error } = await supabase
    .from("org_members")
    .select(`
      org_id,
      organizations (
        id,
        name,
        created_at
      )
    `)
    .eq("user_id", user.id);

  if (error) throw new Error(`Database error: ${error.message}`);
  return data || [];
}