'use server'

import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types";
import { redirect } from "next/navigation";

// --- PATIENT AUTH (PHONE OTP) ---

export async function signInWithOtp(formData: FormData) {
    const phone = formData.get("phone") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
            // Store role in metadata so it persists on user creation
            data: { role: 'patient' }
        }
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function verifyOtp(phone: string, token: string) {
    const supabase = await createClient();

    const { data: { session }, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
    });

    if (error) {
        return { error: error.message };
    }

    if (session) {
        // Trigger should have created the profile by now.
        // We can optionally verify it or just return success.
        return { success: true };
    }

    return { error: "Verification failed." };
}



// --- PATIENT AUTH (EMAIL/PASSWORD) ---

export async function signUpPatient(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const fullName = formData.get("fullName") as string;
        const dob = formData.get("dob") as string;
        const bloodGroup = formData.get("bloodGroup") as string;

        // Emergency Contact
        const emergencyName = formData.get("emergencyName") as string;
        const emergencyPhone = formData.get("emergencyPhone") as string;
        const emergencyContact = { name: emergencyName, phone: emergencyPhone };

        const supabase = await createClient();

        // Pass all needed data in metadata for the trigger to pick up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'patient',
                    dob: dob,
                    blood_group: bloodGroup,
                    emergency_contact: emergencyContact
                },
            },
        });

        if (authError) return { error: authError.message };
        if (!authData.user) return { error: "User creation failed" };

        // Auto-signin if no confirmation required
        if (!authData.session) {
            await supabase.auth.signInWithPassword({ email, password });
        }

        return { success: true };

    } catch (err: any) {
        return { error: "An unexpected error occurred: " + err.message };
    }
}

// --- HOSPITAL & INSURANCE REGISTRATION (EMAIL) ---

export async function signUpHospital(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const hospitalName = formData.get("hospitalName") as string;
        const licenseNumber = formData.get("licenseNumber") as string;
        const address = formData.get("address") as string;

        const supabase = await createClient();

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: hospitalName,
                    role: 'hospital',
                    license_number: licenseNumber,
                    address: address
                },
            },
        });

        if (authError) return { error: authError.message };
        if (!authData.user) return { error: "User creation failed" };

        // Auto-signin 
        if (!authData.session) {
            await supabase.auth.signInWithPassword({ email, password });
        }

        return { success: true };

    } catch (err: any) {
        return { error: "An unexpected error occurred: " + err.message };
    }
}

export async function signUpInsurance(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const companyName = formData.get("companyName") as string;

        const supabase = await createClient();

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: companyName,
                    role: 'insurance',
                },
            },
        });

        if (authError) return { error: authError.message };
        if (!authData.user) return { error: "User creation failed" };

        if (!authData.session) {
            await supabase.auth.signInWithPassword({ email, password });
        }
        return { success: true };

    } catch (err: any) {
        return { error: "An unexpected error occurred: " + err.message };
    }
}
