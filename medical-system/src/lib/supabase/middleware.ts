
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user &&
        !request.nextUrl.pathname.startsWith("/login") &&
        !request.nextUrl.pathname.startsWith("/signup") &&
        !request.nextUrl.pathname.startsWith("/auth") &&
        request.nextUrl.pathname !== "/"
    ) {
        // No user, redirect to login selection or home
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user) {
        // 1. Fetch Role from Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile) {
            const role = profile.role;
            console.log(`[Middleware] User: ${user.id}, Role: ${role}, Path: ${request.nextUrl.pathname}`);
            const path = request.nextUrl.pathname;

            // Role Conflict Redirects
            if (path.startsWith("/hospital") && role !== 'hospital') {
                return NextResponse.redirect(new URL("/unauthorized", request.url));
            }
            if (path.startsWith("/insurance") && role !== 'insurance') {
                return NextResponse.redirect(new URL("/unauthorized", request.url));
            }
            // Patients might view their own portal but nothing else? 
            // Actually, if patient tries to go to /hospital/login or whatever.

            // Login Redirects (Prevent logged-in users from seeing login pages)
            if (path.startsWith("/login")) {
                if (role === 'patient') return NextResponse.redirect(new URL("/patient", request.url)); // Corrected path
                if (role === 'hospital') return NextResponse.redirect(new URL("/hospital", request.url));
                if (role === 'insurance') return NextResponse.redirect(new URL("/insurance", request.url));
            }

            // Verification Gates (DISABLED FOR EXPO DEMO)
            /* 
            if (role === 'hospital' && path.startsWith("/hospital")) {
                const { data: hospital } = await supabase
                    .from('hospitals')
                    .select('verified')
                    .eq('id', user.id)
                    .single();

                if (hospital && !hospital.verified && path !== '/hospital/verification-pending') {
                    return NextResponse.redirect(new URL("/hospital/verification-pending", request.url));
                }
            } 
            */

            // Verification Gates (DISABLED FOR EXPO DEMO)
            /*
            if (role === 'insurance' && path.startsWith("/insurance")) {
                const { data: provider } = await supabase
                    .from('insurance_providers')
                    .select('verified')
                    .eq('id', user.id)
                    .single();

                if (provider && !provider.verified && path !== '/insurance/verification-pending') {
                    return NextResponse.redirect(new URL("/insurance/verification-pending", request.url));
                }
            }
            */
        }
    }

    return response;
}
