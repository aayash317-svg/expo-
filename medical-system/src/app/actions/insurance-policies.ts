'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProviderPolicies() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data, error } = await supabase
        .from('insurance_policies')
        .select(`
            *,
            patients (
                profiles ( full_name, email )
            )
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { policies: data };
}

export async function createPolicy(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const patientEmail = formData.get("patientEmail") as string;
    const policyNumber = formData.get("policyNumber") as string;
    const coverageAmount = formData.get("coverageAmount") as string;
    const validUntil = formData.get("validUntil") as string;

    // 1. Find Patient by Email
    const { data: patientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', patientEmail)
        .eq('role', 'patient')
        .single();

    if (profileError || !patientProfile) {
        return { error: "Patient not found with this email." };
    }

    // 2. Create Policy
    const { error } = await supabase
        .from('insurance_policies')
        .insert({
            provider_id: user.id,
            patient_id: patientProfile.id,
            policy_number: policyNumber,
            coverage_amount: parseFloat(coverageAmount),
            valid_until: validUntil,
            status: 'active'
        });

    if (error) {
        if (error.code === '23505') return { error: "Policy number already exists." };
        return { error: error.message };
    }

    revalidatePath('/insurance/policies');
    redirect('/insurance/policies');
}

export async function seedSamplePolicies() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Create a dummy patient if needed, or find one
    // Ideally we assume at least one patient exists, or we create a placeholder
    // For simplicity, we'll try to find any patient
    const { data: patients } = await supabase.from('profiles').select('id, email').eq('role', 'patient').limit(1);

    let patientId;
    if (patients && patients.length > 0) {
        patientId = patients[0].id;
    } else {
        // Fallback or error
        return { error: "No patients found to assign policies to. Please create a patient account first." };
    }

    const samples = [
        { policy_number: `POL-${Date.now()}-A`, coverage_amount: 50000, status: 'active', valid_until: '2026-12-31' },
        { policy_number: `POL-${Date.now()}-B`, coverage_amount: 100000, status: 'active', valid_until: '2027-06-30' },
        { policy_number: `POL-${Date.now()}-C`, coverage_amount: 75000, status: 'expired', valid_until: '2025-01-01' },
    ];

    for (const sample of samples) {
        await supabase.from('insurance_policies').insert({
            provider_id: user.id,
            patient_id: patientId,
            ...sample
        });
    }

    revalidatePath('/insurance/policies');
    revalidatePath('/insurance');
    return { success: true };
}
