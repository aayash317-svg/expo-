import Link from "next/link";
import {
    Users,
    FileCheck,
    Banknote,
    CalendarClock,
    Plus,
    UserPlus,
    Search,
    ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SeedPoliciesButton } from "@/components/insurance/seed-button";

export default async function InsuranceDashboard() {
    const supabase = await createClient();

    // Fetch Summary Data (Mocked for now, will connect to real DB)
    const stats = [
        { title: "Active Policies", value: "12,450", icon: Users, change: "+2.5%" },
        { title: "Pending Claims", value: "345", icon: FileCheck, change: "-1.2%" },
        { title: "Premium Collected", value: "$5.2M", icon: Banknote, change: "+3.8%" }, // Formatted
        { title: "Policies Expiring Soon", value: "120", icon: CalendarClock, change: "Review" },
    ];

    // Fetch Recent Claims (Mocked or Real)
    // const { data: claims } = await supabase.from('claims').select('*').limit(5);
    // Using Mock Data as placeholder until Claims feature is populated
    const recentClaims = [
        { id: "C-2023-001", customer: "Sarah Johnson", type: "Auto Insurance", status: "Approved" },
        { id: "C-2023-002", customer: "Michael Davis", type: "Home Insurance", status: "Pending" },
        { id: "C-2023-003", customer: "Emily White", type: "Health Insurance", status: "Rejected" },
        { id: "C-2023-004", customer: "David Wilson", type: "Auto Insurance", status: "Approved" },
    ];

    function getStatusBadge(status: string) {
        if (status === 'Approved') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Approved</span>;
        if (status === 'Pending') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>;
        if (status === 'Rejected') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Rejected</span>;
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }

    return (
        <div className="space-y-8">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-xs font-medium text-slate-400 mt-2">
                            <span className={stat.change.includes('+') ? "text-green-600" : "text-slate-500"}>{stat.change}</span> from last month
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/insurance/policies/new" className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        <Plus className="h-4 w-4" /> Create Policy
                    </Link>
                    <button className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                        <UserPlus className="h-4 w-4" /> Register Customer
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                        <FileCheck className="h-4 w-4" /> File Claim
                    </button>
                    <button className="flex items-center justify-center gap-2 p-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                        <ExternalLink className="h-4 w-4" /> View Reports
                    </button>
                    <SeedPoliciesButton />
                </div>
            </div>

            {/* Recent Claims Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Recent Claims</h3>
                    <Link href="/insurance/claims" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Claim ID</th>
                                <th className="px-6 py-4">Customer Name</th>
                                <th className="px-6 py-4">Policy Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentClaims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{claim.id}</td>
                                    <td className="px-6 py-4">{claim.customer}</td>
                                    <td className="px-6 py-4">{claim.type}</td>
                                    <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">View Details</button>
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
