'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

function generateNfcId(): string {
    const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `NFC-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

function generateQrToken(patientId: string, name: string, dob: string): string {
    return JSON.stringify({
        type: 'health_id',
        patient_id: patientId,
        name,
        dob,
        nfc_system: 'NFC Health v1',
        issued_at: new Date().toISOString(),
    });
}

function generatePassword(): string {
    return crypto.randomBytes(4).toString('hex'); // 8 char password
}

export async function registerPatient(data: {
    full_name: string;
    email: string;
    dob: string;
    phone?: string;
    blood_group?: string;
}) {
    const supabase = createAdminClient();
    const password = generatePassword();

    try {
        // 1. Check if email already exists
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const existingUser = users?.find(u => u.email === data.email);

        let userId: string;

        if (existingUser) {
            userId = existingUser.id;
            // Update password and metadata
            await supabase.auth.admin.updateUserById(userId, {
                password,
                user_metadata: { role: 'patient', full_name: data.full_name },
            });
        } else {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: data.email,
                password,
                email_confirm: true,
                user_metadata: { role: 'patient', full_name: data.full_name },
            });

            if (authError) return { error: `Auth error: ${authError.message}` };
            userId = authData.user.id;
        }

        // 2. Upsert profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                full_name: data.full_name,
                role: 'patient',
                email: data.email,
                phone: data.phone || null,
            }, { onConflict: 'id' });

        if (profileError) return { error: `Profile error: ${profileError.message}` };

        // 3. Generate NFC and QR tokens
        const nfcTagId = generateNfcId();
        const qrCodeToken = generateQrToken(userId, data.full_name, data.dob);

        // 4. Upsert patient record
        const { error: patientError } = await supabase
            .from('patients')
            .upsert({
                id: userId,
                dob: data.dob || null,
                blood_group: data.blood_group || null,
                nfc_tag_id: nfcTagId,
                qr_code_token: qrCodeToken,
            }, { onConflict: 'id' });

        if (patientError) return { error: `Patient record error: ${patientError.message}` };

        return {
            success: true,
            patient: {
                id: userId,
                name: data.full_name,
                email: data.email,
                password,
                nfc_tag_id: nfcTagId,
                qr_code_token: qrCodeToken,
            },
        };
    } catch (err: any) {
        return { error: err.message || 'Unknown error' };
    }
}
