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
    ShieldCheck,
    UserPlus
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function InsuranceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

    const userName = profile?.full_name || "Insurance Officer";

    const navItems = [
        { name: "Dashboard", href: "/insurance", icon: LayoutDashboard },
        { name: "Register Patient", href: "/insurance/register-patient", icon: UserPlus },
        { name: "Policy Management", href: "/insurance/policies", icon: FileText },
        { name: "Customers", href: "/insurance/customers", icon: Users },
        { name: "Claims", href: "/insurance/claims", icon: FileCheck },
        { name: "Reports & Analytics", href: "/insurance/reports", icon: BarChart3 },
        { name: "Settings", href: "/insurance/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#0a0e1a] font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0d1221] border-r border-white/[0.06] hidden md:flex flex-col">
                <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-sm leading-none">INSURANCE</h1>
                        <p className="text-[10px] text-blue-400/60 font-medium tracking-widest mt-0.5">DEPARTMENT</p>
                    </div>
                </div>

                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/50 rounded-xl hover:bg-white/[0.06] hover:text-white transition-all duration-200 group"
                        >
                            <item.icon className="h-4.5 w-4.5 text-white/30 group-hover:text-blue-400 transition-colors" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/[0.06]">
                    <div className="text-[10px] text-white/20 text-center tracking-wider">v1.2.0 • Secure Portal</div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-[#0d1221]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        <h2 className="text-base font-semibold text-white/80">Insurance Portal</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative p-2 text-white/30 hover:text-white/60 hover:bg-white/[0.06] rounded-xl transition-all">
                            <Bell className="h-4.5 w-4.5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-[#0d1221]" />
                        </button>

                        <div className="h-5 w-px bg-white/[0.06]" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white/80">{userName}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-wider">Insurance Officer</p>
                            </div>
                            <div className="h-9 w-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                                {userName.charAt(0)}
                            </div>
                        </div>

                        <form action="/auth/signout" method="post">
                            <button className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" title="Sign Out">
                                <LogOut className="h-4.5 w-4.5" />
                            </button>
                        </form>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[#0a0e1a] p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
