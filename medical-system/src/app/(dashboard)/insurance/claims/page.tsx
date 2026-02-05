import { getClaims } from "@/app/actions/insurance";
import Link from "next/link";
import { Search, Filter, FileCheck, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default async function ClaimsPage({
    searchParams,
}: {
    searchParams: { status?: 'pending' | 'approved' | 'rejected' };
}) {
    const statusFilter = searchParams.status;
    const { claims, error } = await getClaims(statusFilter);

    function getStatusBadge(status: string) {
        if (status === 'approved') return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200"><CheckCircle className="h-3 w-3" /> Approved</span>;
        if (status === 'pending') return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200"><AlertCircle className="h-3 w-3" /> Pending</span>;
        if (status === 'rejected') return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><XCircle className="h-3 w-3" /> Rejected</span>;
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Claims Processing</h1>
                    <p className="text-slate-500 text-sm">Review and adjudicate insurance claims.</p>
                </div>
                <div className="flex gap-2">
                    {/* Add export button later */}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search Claim ID, Patient Name..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <Link href="/insurance/claims" className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${!statusFilter ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        All Claims
                    </Link>
                    <Link href="/insurance/claims?status=pending" className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${statusFilter === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        Pending
                    </Link>
                    <Link href="/insurance/claims?status=approved" className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${statusFilter === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        Approved
                    </Link>
                    <Link href="/insurance/claims?status=rejected" className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${statusFilter === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        Rejected
                    </Link>
                </div>
            </div>

            {/* List */}
            {error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    Error loading claims: {error}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    {claims && claims.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Claim ID / Date</th>
                                        <th className="px-6 py-4">Patient</th>
                                        <th className="px-6 py-4">Policy</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {claims.map((claim: any) => (
                                        <tr key={claim.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 line-clamp-1" title={claim.id}>{claim.id}</div>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(claim.submitted_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-800">{claim.patients?.profiles?.full_name || "Unknown"}</div>
                                                <div className="text-xs text-slate-400">{claim.patients?.profiles?.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit">
                                                    <FileCheck className="h-3 w-3" />
                                                    {claim.insurance_policies?.policy_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                ${Number(claim.claim_amount).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(claim.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/insurance/claims/${claim.id}`}
                                                    className="inline-block px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 rounded-md text-xs font-medium transition-colors shadow-sm"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4">
                            <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileCheck className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No claims found</h3>
                            <p className="text-slate-500 mt-1">There are no matching claims to display.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
