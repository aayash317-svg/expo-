import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    return handleSignOut(request);
}

export async function POST(request: Request) {
    return handleSignOut(request);
}

async function handleSignOut(request: Request) {
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get("redirect") || "/";

    // Create the redirect response first so we can attach cookie changes to it
    const response = NextResponse.redirect(new URL(redirectTo, request.url), {
        status: 302,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    // Get cookies from the request
                    const cookieStore = request.headers.get('cookie') || '';
                    return cookieStore.split(';').map(c => {
                        const [name, ...val] = c.trim().split('=');
                        return { name, value: val.join('=') };
                    });
                },
                setAll(cookiesToSet) {
                    // Set cookies on the response
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // This will trigger the setAll logic to clear the auth cookies
    await supabase.auth.signOut();

    // Ensure we don't cache this redirect
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
}
