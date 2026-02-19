'use client';

import { useState } from "react";
import { ClipboardList, Plus, Search, UserCheck, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { searchPatients } from "@/app/actions/hospital";
import { Profile } from "@/types";

export default function HospitalDashboard() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Profile[]>([]);
    const [searching, setSearching] = useState(false);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        const { patients } = await searchPatients(query);
        setResults(patients || []);
        setSearching(false);
    }

    return (
        <div className="space-y-8">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hospital Dashboard</h1>
                    <p className="text-muted-foreground">Manage patient records and hospital operations.</p>
                </div>
                {/* ACTION: Link to NFC System Flask App */}
                <div className="flex gap-4">
                    <a
                        href="http://127.0.0.1:5000"
                        target="_blank"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all"
                    >
                        <Search className="h-4 w-4" />
                        Launch NFC Scanner
                    </a>
                    <button className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                        About Hospital
                    </button>
                </div>
            </div>

            {/* Patient Search Section */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Search className="h-5 w-5 text-emerald-600" />
                    Patient Search
                </h2>
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        type="text"
                        placeholder="Search by Name, Email or Patient ID..."
                        className="flex-1 h-12 px-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    />
                    <button disabled={searching} className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">
                        {searching ? "Searching..." : "Search Database"}
                    </button>
                </form>

                {/* Search Results */}
                {results.length > 0 && (
                    <div className="mt-6 border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {results.map(p => (
                                    <tr key={p.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium">{p.full_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/hospital/patient/${p.id}`} className="text-emerald-600 hover:underline inline-flex items-center gap-1">
                                                View Records <ArrowRight className="h-3 w-3" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-muted/10 border border-border/50 rounded-xl p-6 text-center text-sm text-muted-foreground">
                <p>Use the NFC Scanner to securely access patient records.</p>
            </div>
        </div>
    )
}

function DashboardCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-card border border-border p-6 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{title}</span>
                {icon}
            </div>
            <div className="text-3xl font-bold">{value}</div>
        </div>
    )
}
