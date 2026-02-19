'use client';

import Link from "next/link";
import { ArrowLeft, Shield, Mail, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function PatientLogin() {
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
            router.push('/dashboard');
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none" />

            <div className="w-full max-w-md glass p-8 relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2 mb-8">
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 text-sm font-medium group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Shield className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Patient Access</h1>
                    <p className="text-muted-foreground">Secure Identity Verification</p>
                </div>

                {error && (
                    <div className="p-4 mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                        <Shield className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="email">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-input bg-black/20 pl-11 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1" htmlFor="password">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-12 w-full rounded-xl border border-input bg-black/20 pl-11 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authenticate Securely"}
                    </button>
                </form>

                <div className="text-center text-sm mt-8 pt-6 border-t border-border">
                    <span className="text-muted-foreground">New User? </span>
                    <Link href="/signup/patient" className="text-primary font-medium hover:text-primary/80 hover:underline underline-offset-4 transition-colors">
                        Create Identity
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-4 text-center text-xs text-muted-foreground/40 font-mono tracking-widest uppercase">
                Secured by End-to-End Encryption
            </div>
        </div>
    )
}
