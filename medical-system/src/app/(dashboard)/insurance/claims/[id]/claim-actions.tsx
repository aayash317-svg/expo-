'use client';

import { processClaim } from "@/app/actions/insurance";
import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ClaimActions({ claimId }: { claimId: string }) {
    const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null);
    const [notes, setNotes] = useState("");
    const router = useRouter();

    async function handleProcess(status: 'approved' | 'rejected') {
        if (!confirm(`Are you sure you want to ${status.toUpperCase()} this claim?`)) return;

        setLoading(status);
        const result = await processClaim(claimId, status, notes);

        if (result.error) {
            alert("Error: " + result.error);
            setLoading(null);
        } else {
            // Success
            router.refresh();
            setLoading(null);
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
            <h3 className="font-semibold text-slate-800">Adjudication</h3>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Internal Notes (Optional)</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reason for approval or rejection..."
                    className="w-full text-sm border border-slate-300 rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={() => handleProcess('approved')}
                    disabled={!!loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading === 'approved' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Approve
                </button>
                <button
                    onClick={() => handleProcess('rejected')}
                    disabled={!!loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading === 'rejected' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Reject
                </button>
            </div>
            {loading && <p className="text-xs text-center text-slate-500 animate-pulse">Processing request...</p>}
        </div>
    );
}
