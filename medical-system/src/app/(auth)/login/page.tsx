'use client';

import Link from "next/link";
import { Shield, User, Lock, Loader2, Building2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const roles = [
    { key: 'patient', label: 'Patient', icon: User, color: 'cyan' },
    { key: 'hospital', label: 'Hospital', icon: Building2, color: 'emerald' },
    { key: 'insurance', label: 'Insurance', icon: ShieldCheck, color: 'purple' },
    { key: 'admin', label: 'Admin', icon: Shield, color: 'red' },
] as const;

const colorMap: Record<string, { ring: string; bg: string; border: string; text: string; btn: string; shadow: string }> = {
    cyan: {
        ring: 'focus-visible:ring-cyan-500',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        btn: 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/20 hover:shadow-cyan-500/40',
        shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
    },
    emerald: {
        ring: 'focus-visible:ring-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 hover:shadow-emerald-500/40',
        shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    },
    purple: {
        ring: 'focus-visible:ring-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        btn: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 hover:shadow-purple-500/40',
        shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    },
    red: {
        ring: 'focus-visible:ring-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        btn: 'bg-red-600 hover:bg-red-700 shadow-red-500/20 hover:shadow-red-500/40',
        shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    },
};

export default function UnifiedLogin() {
    const router = useRouter();
    const [selectedRole, setSelectedRole] = useState<string>('patient');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeRole = roles.find(r => r.key === selectedRole)!;
    const colors = colorMap[activeRole.color];

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            // Redirect based on role — middleware will handle the actual routing
            const redirectMap: Record<string, string> = {
                patient: '/patient',
                hospital: '/hospital',
                insurance: '/insurance',
                admin: '/admin',
            };
            router.push(redirectMap[selectedRole] || '/');
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[128px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className={`h-16 w-16 ${colors.bg} ${colors.text} rounded-2xl flex items-center justify-center mx-auto mb-4 border ${colors.border} ${colors.shadow} transition-all duration-300`}>
                        <activeRole.icon className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">NFC Health System</h1>
                    <p className="text-muted-foreground">Sign in to your account</p>
                </div>

                {/* Role Selector */}
                <div className="glass p-1.5 flex gap-1 rounded-xl">
                    {roles.map((role) => {
                        const RoleIcon = role.icon;
                        const isActive = selectedRole === role.key;
                        const rc = colorMap[role.color];
                        return (
                            <button
                                key={role.key}
                                onClick={() => { setSelectedRole(role.key); setError(null); }}
                                className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${isActive
                                    ? `${rc.bg} ${rc.text} ${rc.border} border`
                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                    }`}
                            >
                                <RoleIcon className="h-4 w-4" />
                                {role.label}
                            </button>
                        );
                    })}
                </div>

                {/* Login Form */}
                <div className="glass p-8">
                    {error && (
                        <div className="p-4 mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                            <Shield className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="email">Email</label>
                            <div className="relative group">
                                <User className={`absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:${colors.text} transition-colors`} />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`flex h-12 w-full rounded-xl border border-input bg-black/20 pl-11 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 ${colors.ring} focus-visible:border-transparent transition-all`}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="password">Password</label>
                            <div className="relative group">
                                <Lock className={`absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:${colors.text} transition-colors`} />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`flex h-12 w-full rounded-xl border border-input bg-black/20 pl-11 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 ${colors.ring} focus-visible:border-transparent transition-all`}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className={`w-full h-12 ${colors.btn} text-white rounded-xl font-bold transition-all shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2`}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `Sign in as ${activeRole.label}`}
                        </button>
                    </form>


                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
