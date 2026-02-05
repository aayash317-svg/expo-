import { getProviderPolicies } from "@/app/actions/insurance-policies";
import Link from "next/link";
import { Plus, Search, FileText } from "lucide-react";

export default async function PoliciesPage() {
    const { policies, error } = await getProviderPolicies();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Policy Management</h1>
                    <p className="text-slate-500 text-sm">Manage and track patient insurance policies.</p>
                </div>
                <Link
                    href="/insurance/policies/new"
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
                >
                    <Plus className="h-4 w-4" />
                    New Policy
                </Link>
            </div>

            {/* Filters (Visual only for now) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by policy number or patient name..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                    Filter Status
                </button>
            </div>

            {/* Content */}
            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    Error loading policies: {error}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {policies && policies.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Policy Number</th>
                                        <th className="px-6 py-4">Patient</th>
                                        <th className="px-6 py-4">Coverage</th>
                                        <th className="px-6 py-4">Valid Until</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {policies.map((policy: any) => {
                                        const patientName = policy.patients?.profiles?.full_name || "Unknown";
                                        const patientEmail = policy.patients?.profiles?.email || "-";

                                        return (
                                            <tr key={policy.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900 group cursor-pointer">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-slate-400" />
                                                        {policy.policy_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800">{patientName}</div>
                                                    <div className="text-xs text-slate-400">{patientEmail}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    ${Number(policy.coverage_amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {new Date(policy.valid_until).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${policy.status === 'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                        {policy.status ? policy.status.toUpperCase() : 'UNKNOWN'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Manage</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4">
                            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No policies found</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                                You haven&apos;t created any insurance policies yet. Create one to get started.
                            </p>
                            <Link href="/insurance/policies/new" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                <Plus className="h-4 w-4" />
                                Create First Policy
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
