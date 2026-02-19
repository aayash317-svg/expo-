import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Building2, ShieldCheck, Users, Plus } from "lucide-react";
import Link from "next/link";

async function getStats() {
    const supabase = createAdminClient();
    const [{ count: hospitalCount }, { count: insuranceCount }, { count: patientCount }] = await Promise.all([
        supabase.from("hospitals").select("*", { count: "exact", head: true }),
        supabase.from("insurance_providers").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "patient"),
    ]);
    return { hospitalCount: hospitalCount ?? 0, insuranceCount: insuranceCount ?? 0, patientCount: patientCount ?? 0 };
}

export default async function AdminDashboard() {
    const { hospitalCount, insuranceCount, patientCount } = await getStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">System overview and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Hospitals</span>
                        <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{hospitalCount}</p>
                    <p className="text-xs text-muted-foreground">Registered hospital nodes</p>
                </div>

                <div className="glass p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Insurers</span>
                        <div className="h-9 w-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-purple-400" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{insuranceCount}</p>
                    <p className="text-xs text-muted-foreground">Insurance providers</p>
                </div>

                <div className="glass p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Patients</span>
                        <div className="h-9 w-9 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                            <Users className="h-5 w-5 text-cyan-400" />
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{patientCount}</p>
                    <p className="text-xs text-muted-foreground">Registered patients</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/admin/create-org" className="glass p-6 flex items-center gap-4 hover:border-primary/30 transition-all group">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground">Create Organization</h3>
                            <p className="text-sm text-muted-foreground">Add a hospital or insurance provider</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
