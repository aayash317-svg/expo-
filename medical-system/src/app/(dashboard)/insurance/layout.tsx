import Link from "next/link";
import {
    LayoutDashboard,
    FileText,
    Users,
    FileCheck,
    BarChart3,
    Settings,
    Bell,
    LogOut,
    ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth-buttons";

export default async function InsuranceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login/insurance");
    }

    // Get profile data for the header
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    const userName = profile?.full_name || "Insurance Officer";

    const navItems = [
        { name: "Dashboard", href: "/insurance", icon: LayoutDashboard },
        { name: "Policy Management", href: "/insurance/policies", icon: FileText },
        { name: "Customers", href: "/insurance/customers", icon: Users },
        { name: "Claims", href: "/insurance/claims", icon: FileCheck },
        { name: "Reports & Analytics", href: "/insurance/reports", icon: BarChart3 },
        { name: "Settings", href: "/insurance/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <div className="bg-blue-900 text-white p-1.5 rounded-lg">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900 leading-none">INSURANCE</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wider mt-1">DEPARTMENT</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-700 transition-colors group"
                        >
                            <item.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    {/* Placeholder for footer info or additional links */}
                    <div className="text-xs text-slate-400 text-center">v1.2.0 • Secure Portal</div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-slate-800">Overview</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        <div className="h-6 w-px bg-slate-200 mx-1"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-900">{userName}</p>
                                <p className="text-xs text-slate-500">Insurance Officer</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                {userName.charAt(0)}
                            </div>
                        </div>

                        <div className="ml-2">
                            <form action="/auth/signout" method="post">
                                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Sign Out">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
