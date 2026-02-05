import { getClaimById } from "@/app/actions/insurance";
import Link from "next/link";
import { ArrowLeft, User, FileText, Calendar, DollarSign, Activity } from "lucide-react";
import ClaimActions from "./claim-actions";

export default async function ClaimDetailPage({ params }: { params: { id: string } }) {
    const { claim, error } = await getClaimById(params.id);

    if (error || !claim) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
                <h3 className="font-bold">Error Loading Claim</h3>
                <p>{error || "Claim not found"}</p>
                <Link href="/insurance/claims" className="mt-4 inline-block text-blue-600 hover:underline">Return to Claims</Link>
            </div>
        );
    }

    const patient = claim.patients;
    const policy = claim.insurance_policies;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/insurance/claims" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 mb-2 w-fit">
                <ArrowLeft className="h-4 w-4" />
                Back to Claims
            </Link>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Claim Details</h1>
                    <p className="text-slate-500 text-sm">ID: {claim.id}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${claim.status === 'approved' ? 'bg-green-100 text-green-700' :
                        claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                    }`}>
                    {claim.status}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-6">

                    {/* Patient Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            Patient Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Full Name</label>
                                <p className="text-slate-900 font-medium">{patient?.profiles?.full_name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Email</label>
                                <p className="text-slate-900">{patient?.profiles?.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Phone</label>
                                <p className="text-slate-900">{patient?.profiles?.phone || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Blood Group</label>
                                <p className="text-slate-900">{patient?.blood_group || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Policy Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            Policy Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Policy Number</label>
                                <p className="text-slate-900 font-medium font-mono">{policy?.policy_number}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Max Coverage</label>
                                <p className="text-slate-900 font-semibold">${Number(policy?.coverage_amount).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Valid Until</label>
                                <p className="text-slate-900">{new Date(policy?.valid_until).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Claim Description */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-slate-400" />
                            Claim Description
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Claim Amount</label>
                                <p className="text-2xl font-bold text-slate-900">${Number(claim.claim_amount).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Submission Notes</label>
                                <p className="text-slate-700 mt-1 bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                                    {claim.notes || "No notes provided by patient."}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Submitted Date</label>
                                <p className="text-slate-900 text-sm flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(claim.submitted_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    {claim.status === 'pending' ? (
                        <ClaimActions claimId={claim.id} />
                    ) : (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
                            <h3 className="font-semibold text-slate-800 mb-2">Processed</h3>
                            <p className="text-slate-500 text-sm mb-4">
                                This claim was {claim.status} on {claim.processed_at ? new Date(claim.processed_at).toLocaleDateString() : 'N/A'}.
                            </p>
                            {claim.notes && (
                                <div className="text-left bg-white p-3 rounded border border-slate-200 text-xs">
                                    <span className="font-bold text-slate-600 block mb-1">Adjudicator Notes:</span>
                                    {claim.notes}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
