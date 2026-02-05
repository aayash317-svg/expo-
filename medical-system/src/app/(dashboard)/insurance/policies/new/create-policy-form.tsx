'use client';

import { createPolicy } from "@/app/actions/insurance-policies";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

// Submit Button Component for pending state
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Policy...
                </>
            ) : (
                <>
                    <Save className="h-4 w-4" />
                    Create Policy
                </>
            )}
        </button>
    );
}

const initialState = {
    error: null as string | null,
};

export default function CreatePolicyForm() {
    const [state, formAction] = useActionState(createPolicy, initialState);

    return (
        <div className="max-w-2xl mx-auto">

            <div className="mb-6">
                <Link href="/insurance/policies" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 mb-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Policies
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Create New Policy</h1>
                <p className="text-slate-500 text-sm">Issue a new insurance policy to a registered patient.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-8">
                <form action={formAction} className="space-y-6">

                    {state?.error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="patientEmail" className="block text-sm font-medium text-slate-700">Patient Email Address</label>
                            <input
                                type="email"
                                name="patientEmail"
                                required
                                placeholder="patient@example.com"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <p className="text-xs text-slate-500">The patient must be already registered in the system.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="policyNumber" className="block text-sm font-medium text-slate-700">Policy Number</label>
                                <input
                                    type="text"
                                    name="policyNumber"
                                    required
                                    placeholder="POL-12345678"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm uppercase"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="coverageAmount" className="block text-sm font-medium text-slate-700">Coverage Maximum ($)</label>
                                <input
                                    type="number"
                                    name="coverageAmount"
                                    required
                                    min="0"
                                    placeholder="50000"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="validUntil" className="block text-sm font-medium text-slate-700">Valid Until</label>
                            <input
                                type="date"
                                name="validUntil"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <SubmitButton />
                    </div>

                </form>
            </div>
        </div>
    );
}
