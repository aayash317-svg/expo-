import { createClient } from "@/lib/supabase/server";
import { Activity, Calendar, FileText, ShieldCheck, User } from "lucide-react";
import { redirect } from "next/navigation";
import { PatientIdentityCard } from "@/components/PatientIdentityCard";

export default async function PatientDashboard() {
    const supabase = await createClient();

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 2. Fetch Patient Profile & Details
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select(`
      *,
      profiles (
        full_name,
        email
      )
    `)
        .eq('id', user.id)
        .single();

    if (patientError && patientError.code !== 'PGRST116') {
        console.error("Patient load error:", patientError?.message || "Unknown error");
    }

    const profile = patient?.profiles;

    // 3. Fetch Medical Records (Limit 5)
    const { data: records } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    // 4. Fetch Insurance Policy
    const { data: policy } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('patient_id', user.id)
        .single();

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Welcome back, {profile?.full_name?.split(' ')[0] || 'Patient'}
                    </h1>
                    <p className="text-muted-foreground">Here's your health summary for today.</p>
                </div>
            </div>

            {/* NFC / QR Identity Card (Client Component) */}
            {patient?.nfc_tag_id && patient?.qr_code_token && (
                <PatientIdentityCard
                    nfcTagId={patient.nfc_tag_id}
                    qrCodeToken={patient.qr_code_token}
                    patientId={patient.id}
                />
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Blood Group"
                    value={patient?.blood_group || "N/A"}
                    icon={<Activity className="h-5 w-5 text-red-500" />}
                    subtext="Verified"
                />
                <StatCard
                    title="Date of Birth"
                    value={patient?.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}
                    icon={<Calendar className="h-5 w-5 text-blue-500" />}
                    subtext="Profile"
                />
                <StatCard
                    title="Active Policy"
                    value={policy ? "Active" : "None"}
                    icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
                    subtext={policy?.policy_number || "No Policy"}
                />
                <StatCard
                    title="Total Records"
                    value={records?.length?.toString() || "0"}
                    icon={<FileText className="h-5 w-5 text-purple-500" />}
                    subtext="Saved on Cloud"
                />
            </div>

            {/* Recent Records & Emergency Contact */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent History */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                        Recent Medical Activity
                    </h3>
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        {!records || records.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No medical records found.
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {records.map((rec: any) => (
                                    <div key={rec.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {rec.record_type?.substring(0, 3).toUpperCase() || 'REC'}
                                            </div>
                                            <div>
                                                <h4 className="font-medium group-hover:text-primary transition-colors">
                                                    {rec.title}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(rec.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center rounded-full border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors">
                                                View
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-3 text-center border-t border-border bg-muted/20">
                            <button className="text-sm font-medium text-primary hover:underline">View All Records</button>
                        </div>
                    </div>
                </div>

                {/* Emergency Contact Card */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        Emergency Contact
                    </h3>
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Contact Name</p>
                            <p className="font-medium">{patient?.emergency_contact?.name || "Not Set"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Phone Number</p>
                            <p className="font-medium">{patient?.emergency_contact?.phone || "Not Set"}</p>
                        </div>
                        <div className="pt-4">
                            <button className="w-full py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg text-sm font-medium transition-colors">
                                Emergency SOS Mode
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subtext }: { title: string, value: string, icon: React.ReactNode, subtext: string }) {
    return (
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                {icon}
            </div>
            <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight truncate">{value}</h3>
                <p className="text-xs text-muted-foreground">{subtext}</p>
            </div>
        </div>
    )
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" />
            <path d="M3 3v9h9" />
            <path d="M12 7v5l4 2" />
        </svg>
    )
}
