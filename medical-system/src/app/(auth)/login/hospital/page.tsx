'use client';

import Link from "next/link";
import { ArrowLeft, Activity, User, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function HospitalLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/dashboard/hospital'); // Verify correct redirect
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="w-full max-w-md glass p-8 relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95 border-primary/20">
                <div className="flex items-center gap-2 mb-8">
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm font-medium group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Return to Portal
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-secondary/20 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                        <Activity className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Hospital Node</h1>
                    <p className="text-muted-foreground">Authorized Personnel Only</p>
                </div>

                {error && (
                    <div className="p-4 mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                        <Activity className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="email">Hospital ID / Email</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@hospital.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-input bg-black/20 pl-11 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="password">Access Key</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-input bg-black/20 pl-11 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl font-bold transition-all shadow-lg shadow-secondary/20 hover:shadow-secondary/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Credentials"}
                    </button>
                </form>


            </div>

            <div className="absolute bottom-4 text-center text-xs text-muted-foreground/40 font-mono tracking-widest uppercase">
                Restricted Access Zone
            </div>
        </div>
    )
}
