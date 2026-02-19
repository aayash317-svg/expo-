import Link from "next/link";
import {
    Users,
    FileCheck,
    Banknote,
    CalendarClock,
    Plus,
    UserPlus,
    ExternalLink,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function InsuranceDashboard() {
    const supabase = await createClient();

    const stats = [
        { title: "Active Policies", value: "12,450", icon: Users, change: "+2.5%", up: true, color: "from-blue-500 to-cyan-400" },
        { title: "Pending Claims", value: "345", icon: FileCheck, change: "-1.2%", up: false, color: "from-amber-500 to-orange-400" },
        { title: "Premium Collected", value: "$5.2M", icon: Banknote, change: "+3.8%", up: true, color: "from-emerald-500 to-green-400" },
        { title: "Expiring Soon", value: "120", icon: CalendarClock, change: "Review", up: false, color: "from-rose-500 to-pink-400" },
    ];

    const recentClaims = [
        { id: "C-2023-001", customer: "Sarah Johnson", type: "Health Insurance", status: "Approved", amount: "$2,450" },
        { id: "C-2023-002", customer: "Michael Davis", type: "Health Insurance", status: "Pending", amount: "$1,800" },
        { id: "C-2023-003", customer: "Emily White", type: "Health Insurance", status: "Rejected", amount: "$3,200" },
        { id: "C-2023-004", customer: "David Wilson", type: "Health Insurance", status: "Approved", amount: "$950" },
        { id: "C-2023-005", customer: "Lisa Chen", type: "Health Insurance", status: "Pending", amount: "$4,100" },
    ];

    function getStatusBadge(status: string) {
        const styles: Record<string, string> = {
            Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
            Pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
            Rejected: "bg-red-500/15 text-red-400 border-red-500/20",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-slate-500/15 text-slate-400 border-slate-500/20"}`}>
                {status}
            </span>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* Hero Welcome */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20 border border-white/10 p-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Insurance Command Center</h1>
                        <p className="text-blue-200/70 mt-1">Manage policies, patients, and claims from one place.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs text-emerald-400 font-medium">System Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
                        {/* Gradient accent */}
                        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />

                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20`} style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))` }}>
                                <stat.icon className="h-5 w-5 text-white/80" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-5">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/insurance/policies/new" className="group flex items-center justify-center gap-2.5 p-4 bg-blue-600/20 border border-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-600/30 hover:border-blue-500/30 transition-all font-medium text-sm">
                        <Plus className="h-4 w-4" /> Create Policy
                    </Link>
                    <Link href="/insurance/register-patient" className="group flex items-center justify-center gap-2.5 p-4 bg-emerald-600/20 border border-emerald-500/20 text-emerald-300 rounded-xl hover:bg-emerald-600/30 hover:border-emerald-500/30 transition-all font-medium text-sm">
                        <UserPlus className="h-4 w-4" /> Add Patient
                    </Link>
                    <Link href="/insurance/claims" className="group flex items-center justify-center gap-2.5 p-4 bg-white/[0.04] border border-white/[0.06] text-white/60 rounded-xl hover:bg-white/[0.08] hover:text-white/80 transition-all font-medium text-sm">
                        <FileCheck className="h-4 w-4" /> Process Claims
                    </Link>
                    <Link href="/insurance/customers" className="group flex items-center justify-center gap-2.5 p-4 bg-white/[0.04] border border-white/[0.06] text-white/60 rounded-xl hover:bg-white/[0.08] hover:text-white/80 transition-all font-medium text-sm">
                        <Users className="h-4 w-4" /> View Customers
                    </Link>
                </div>
            </div>

            {/* Recent Claims Table */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/15 rounded-lg">
                            <Activity className="h-4 w-4 text-amber-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Recent Claims</h3>
                    </div>
                    <Link href="/insurance/claims" className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        View All <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/[0.04]">
                                <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Claim ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-white/30 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {recentClaims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-white/80">{claim.id}</td>
                                    <td className="px-6 py-4 text-white/70">{claim.customer}</td>
                                    <td className="px-6 py-4 text-white/50">{claim.type}</td>
                                    <td className="px-6 py-4 font-semibold text-white/80">{claim.amount}</td>
                                    <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-400 hover:text-blue-300 font-medium text-xs transition-colors">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
