'use client';

import { useState } from 'react';
import { registerPatient } from '@/app/actions/register-patient';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { Loader2, UserPlus, Activity, Save, CheckCircle, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterPatientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        dob: '',
        phone: '',
        blood_group: '',
    });
    const [result, setResult] = useState<{
        id: string;
        name: string;
        email: string;
        password: string;
        nfc_tag_id: string;
        qr_code_token: string;
    } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = await registerPatient({
            full_name: formData.full_name,
            email: formData.email,
            dob: formData.dob,
            phone: formData.phone || undefined,
            blood_group: formData.blood_group || undefined,
        });

        if (res.error) {
            alert('Error: ' + res.error);
            setLoading(false);
            return;
        }

        if (res.patient) {
            setResult(res.patient);
            setStep('success');
        }
        setLoading(false);
    }

    function copyToClipboard(text: string, field: string) {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    }

    function CopyButton({ text, field }: { text: string; field: string }) {
        return (
            <button
                onClick={() => copyToClipboard(text, field)}
                className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                title="Copy"
            >
                {copiedField === field ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <UserPlus className="h-8 w-8 text-primary" />
                        Register New Patient
                    </h1>
                    <p className="text-muted-foreground mt-2">Create patient identity with NFC/QR tokens.</p>
                </div>
                <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                    Agent Mode Active
                </div>
            </div>

            {step === 'form' ? (
                <div className="glass p-8 animate-in fade-in slide-in-from-bottom-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Full Name *</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full h-12 rounded-xl bg-black/20 border border-input px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Email *</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="patient@example.com"
                                    className="w-full h-12 rounded-xl bg-black/20 border border-input px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Date of Birth *</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full h-12 rounded-xl bg-black/20 border border-input px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.dob}
                                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full h-12 rounded-xl bg-black/20 border border-input px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                                <select
                                    className="w-full h-12 rounded-xl bg-slate-900 border border-white/10 px-4 text-foreground focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                                    value={formData.blood_group}
                                    onChange={e => setFormData({ ...formData, blood_group: e.target.value })}
                                >
                                    <option value="" className="bg-slate-900 text-foreground">Select Blood Group</option>
                                    <option value="A+" className="bg-slate-900 text-foreground">A+</option>
                                    <option value="A-" className="bg-slate-900 text-foreground">A-</option>
                                    <option value="B+" className="bg-slate-900 text-foreground">B+</option>
                                    <option value="B-" className="bg-slate-900 text-foreground">B-</option>
                                    <option value="AB+" className="bg-slate-900 text-foreground">AB+</option>
                                    <option value="AB-" className="bg-slate-900 text-foreground">AB-</option>
                                    <option value="O+" className="bg-slate-900 text-foreground">O+</option>
                                    <option value="O-" className="bg-slate-900 text-foreground">O-</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Register Patient
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="glass p-8 animate-in zoom-in-95 space-y-8">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Patient Registered Successfully!</h2>
                        <p className="text-muted-foreground">Digital Health Identity has been generated.</p>
                    </div>

                    {/* Credentials Card */}
                    <div className="bg-black/30 border border-primary/20 p-6 rounded-2xl space-y-4 max-w-lg mx-auto">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Patient Login Credentials</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-mono text-sm text-foreground">{result?.email}</p>
                                </div>
                                <CopyButton text={result?.email || ''} field="email" />
                            </div>
                            <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground">Password</p>
                                    <p className="font-mono text-sm text-foreground">{result?.password}</p>
                                </div>
                                <CopyButton text={result?.password || ''} field="password" />
                            </div>
                            <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg">
                                <div>
                                    <p className="text-xs text-muted-foreground">NFC Tag ID</p>
                                    <p className="font-mono text-sm text-cyan-400 font-bold">{result?.nfc_tag_id}</p>
                                </div>
                                <CopyButton text={result?.nfc_tag_id || ''} field="nfc" />
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center gap-4 bg-black/20 p-8 rounded-2xl border border-white/5 max-w-sm mx-auto">
                        <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Health Identity QR</div>
                        {result && <QRCodeGenerator value={result.qr_code_token} size={180} />}
                        <p className="text-xs text-muted-foreground text-center">
                            Patient can scan this QR at any hospital node to access their records.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <button
                            onClick={() => {
                                setStep('form');
                                setFormData({ full_name: '', email: '', dob: '', phone: '', blood_group: '' });
                                setResult(null);
                            }}
                            className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                            <UserPlus className="h-4 w-4" />
                            Register Another
                        </button>
                        <button
                            onClick={() => router.push('/insurance')}
                            className="flex-1 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-all"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
