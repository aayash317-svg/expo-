import Link from "next/link";
import {
    History,
    LayoutDashboard,
    LogOut,
    Settings,
    Shield,
    User,
    Search,
    FileText
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Default to patient links if unknown, but normally middleware protects this
    let role = 'patient';
    let sidebarLinks = [];

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (profile) role = profile.role;
    }

    // Dynamic Links Configuration
    // Dynamic Links Configuration
    if (role === 'hospital') {
        sidebarLinks = [
            { href: "/hospital", label: "Patient Search", icon: <Search className="h-5 w-5" /> },
            { href: "http://127.0.0.1:5000/scan", label: "NFC Scanner", icon: <LayoutDashboard className="h-5 w-5" />, external: true },
        ];
    } else if (role === 'insurance') {
        sidebarLinks = [
            { href: "/insurance", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
            { href: "/insurance/register-patient", label: "Register Patient", icon: <User className="h-5 w-5" /> },
            { href: "/insurance/claims", label: "Claims Processing", icon: <FileText className="h-5 w-5" /> },
        ];
    } else if (role === 'admin' || role === 'service_role') {
        sidebarLinks = [
            { href: "/admin/create-org", label: "Manage Orgs", icon: <Shield className="h-5 w-5" /> },
        ];
    } else {
        // Patient (Default)
        sidebarLinks = [
            { href: "/dashboard", label: "My Health ID", icon: <User className="h-5 w-5" /> },
        ];
    }

    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
                <div className="p-6 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">HealthOne</span>
                    </div>
                </div>

                <SidebarNav links={sidebarLinks} />

                <div className="p-4 border-t border-border/50">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg font-medium transition-colors">
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
                    <h2 className="font-semibold text-lg capitalize">{role} Portal</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase">
                            {role.slice(0, 2)}
                        </div>
                    </div>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
