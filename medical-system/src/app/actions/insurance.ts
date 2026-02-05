'use server'

import { createClient } from "@/lib/supabase/server";
import { Claim, InsurancePolicy, Profile } from "@/types";
import { revalidatePath } from "next/cache";

export async function getInsuranceStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Get stats for this provider
    const { count: pendingCount } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id)
        .eq('status', 'pending');

    const { count: approvedCount } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id)
        .eq('status', 'approved'); // Assuming 'approved' implies processed today logic for now for simplicity

    const { count: totalCount } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id);

    return {
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        total: totalCount || 0
    };
}

export async function getRecentClaims() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data, error } = await supabase
        .from('claims')
        .select(`
            *,
            patients (
                profiles ( full_name )
            ),
            insurance_policies ( policy_number )
        `)
        .eq('provider_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

    if (error) {
        // Log the error but verify if it's permission related or empty data related
        // console.error("Claim Fetch Error:", error.message);
        return { error: "Failed to fetch claims: " + error.message };
    }

    return { claims: data };
}

export async function verifyPolicy(policyNumber: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('insurance_policies')
        .select(`
            *,
            patients (
                blood_group,
                profiles ( full_name, email )
            )
        `)
        .eq('policy_number', policyNumber)
        .single();

    if (error || !data) {
        return { error: "Policy not found or invalid." };
    }

    return { policy: data };
}

export async function processClaim(claimId: string, status: 'approved' | 'rejected', notes?: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('claims')
        .update({
            status: status,
            processed_at: new Date().toISOString(),
            notes: notes
        })
        .eq('id', claimId);

    if (error) return { error: error.message };

    revalidatePath('/insurance');
    return { success: true };
}

export async function getProviderCustomers() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Fetch unique patients via policies
    const { data, error } = await supabase
        .from('insurance_policies')
        .select(`
            patient_id,
            patients (
                *,
                profiles ( full_name, email, phone )
            )
        `)
        .eq('provider_id', user.id);

    if (error) return { error: error.message };

    // Deduplicate patients manually in JS since Supabase/Postgrest DISTINCT ON is tricky with joins
    const customersMap = new Map();
    data.forEach((policy: any) => {
        if (policy.patients && !customersMap.has(policy.patient_id)) {
            customersMap.set(policy.patient_id, policy.patients);
        }
    });

    return { customers: Array.from(customersMap.values()) };
}

export async function getClaims(status?: 'pending' | 'approved' | 'rejected') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    let query = supabase
        .from('claims')
        .select(`
            *,
            patients (
                profiles ( full_name, email )
            ),
            insurance_policies ( policy_number )
        `)
        .eq('provider_id', user.id)
        .order('submitted_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) return { error: error.message };
    return { claims: data };
}

export async function getClaimById(claimId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data, error } = await supabase
        .from('claims')
        .select(`
            *,
            patients (
                *,
                profiles ( full_name, email, phone )
            ),
            insurance_policies ( 
                policy_number, 
                coverage_amount,
                valid_until
            )
        `)
        .eq('id', claimId)
        .eq('provider_id', user.id)
        .single();

    if (error) return { error: error.message };
    return { claim: data };
}
