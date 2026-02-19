'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, FileText, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function MedicalHistoryForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const patientId = searchParams.get('patient_id');

    const [loading, setLoading] = useState(false);
    const [record, setRecord] = useState({
        title: 'Initial Health Assessment',
        description: '',
        record_type: 'text'
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient();

        const { error } = await supabase
            .from('medical_records')
            .insert({
                patient_id: patientId,
                title: record.title,
                description: record.description,
                record_type: record.record_type,
                hospital_id: null // Added by Insurance, so null hospital_id? Or need insurance_id column? Schema says hospital_id. Maybe add note in description.
            });

        if (error) {
            alert('Error adding record: ' + error.message);
            setLoading(false);
        } else {
            alert('Medical history added successfully.');
            router.push('/insurance/customers'); // Redirect to list
        }
    }

    if (!patientId) {
        return <div className="p-8 text-center text-muted-foreground">No patient selected.</div>;
    }

    return (
        <div className="glass p-8 max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Add Medical History
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Record Title</label>
                    <input
                        required
                        type="text"
                        className="w-full h-12 rounded-xl bg-black/20 border border-input px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                        value={record.title}
                        onChange={e => setRecord({ ...record, title: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Record Type</label>
                    <select
                        className="w-full h-12 rounded-xl bg-black/20 border border-input px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                        value={record.record_type}
                        onChange={e => setRecord({ ...record, record_type: e.target.value })}
                    >
                        <option value="text">General Note</option>
                        <option value="prescription">Prescription</option>
                        <option value="lab_result">Lab Result</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Description / Notes</label>
                    <textarea
                        required
                        className="w-full min-h-[150px] rounded-xl bg-black/20 border border-input p-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                        value={record.description}
                        onChange={e => setRecord({ ...record, description: e.target.value })}
                        placeholder="Enter detailed medical history, existing conditions, or policy notes..."
                    />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/insurance/customers')}
                        className="px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-all"
                    >
                        Skip
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>
                                <Save className="h-5 w-5" />
                                Save Record
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function MedicalHistoryPage() {
    return (
        <div className="p-8">
            <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
                <MedicalHistoryForm />
            </Suspense>
        </div>
    );
}
