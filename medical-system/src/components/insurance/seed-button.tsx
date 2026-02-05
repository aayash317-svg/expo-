'use client';

import { seedSamplePolicies } from "@/app/actions/insurance-policies";
import { Loader2, Database } from "lucide-react";
import { useState } from "react";

export function SeedPoliciesButton() {
    const [loading, setLoading] = useState(false);

    async function handleSeed() {
        if (!confirm("Add sample policies?")) return;
        setLoading(true);
        await seedSamplePolicies();
        setLoading(false);
        // Refresh page to see stats update
        window.location.reload();
    }

    return (
        <button
            onClick={handleSeed}
            disabled={loading}
            className="flex items-center justify-center gap-2 p-3 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-200 transition-colors font-medium"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Seed Data
        </button>
    );
}
