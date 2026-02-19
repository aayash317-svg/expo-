'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function createOrganization(data: {
    orgType: 'hospital' | 'insurance';
    name: string;
    email: string;
    generatedId: string;
    generatedPassword: string;
}) {
    const supabase = createAdminClient();

    try {
        // 1. Check if user already exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) return { error: `Auth list error: ${listError.message}` };

        let userId: string;
        // Search more robustly
        const existingUser = users.find(u => u.email === data.email);

        if (existingUser) {
            userId = existingUser.id;
            // Force update password and metadata
            const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
                password: data.generatedPassword,
                user_metadata: {
                    role: data.orgType === 'hospital' ? 'hospital' : 'insurance',
                    full_name: data.name,
                },
            });
            if (updateError) return { error: `Auth update error: ${updateError.message}` };
        } else {
            // Create user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: data.email,
                password: data.generatedPassword,
                email_confirm: true,
                user_metadata: {
                    role: data.orgType === 'hospital' ? 'hospital' : 'insurance',
                    full_name: data.name,
                },
            });

            if (authError) {
                // If it still says registered, it's a pagination issue with listUsers
                if (authError.message.includes("already been registered")) {
                    return { error: "User exists but was not found in the first 50 results. Please use a unique email or contact support to reset this account." };
                }
                return { error: `Auth error: ${authError.message}` };
            }
            userId = authData.user.id;
        }

        // 2. Ensure a profile exists and has the correct role
        const { data: profileData } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('id', userId)
            .single();

        const targetRole = data.orgType === 'hospital' ? 'hospital' : 'insurance';

        if (!profileData) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    full_name: data.name,
                    role: targetRole,
                    email: data.email,
                });

            if (profileError) return { error: `Profile create error: ${profileError.message}` };
        } else if (profileData.role !== targetRole) {
            // Update role if it's different
            const { error: profileUpdateError } = await supabase
                .from('profiles')
                .update({ role: targetRole })
                .eq('id', userId);

            if (profileUpdateError) return { error: `Profile update error: ${profileUpdateError.message}` };
        }

        // 3. Insert into the org-specific table
        if (data.orgType === 'hospital') {
            const { error: orgError } = await supabase
                .from('hospitals')
                .upsert({
                    id: userId,
                    license_number: data.generatedId,
                    address: 'Pending',
                    verified: true,
                }, { onConflict: 'id' });

            if (orgError) {
                return { error: `Hospital record error: ${orgError.message}` };
            }
        } else {
            const { error: orgError } = await supabase
                .from('insurance_providers')
                .upsert({
                    id: userId,
                    company_name: data.name,
                    verified: true,
                }, { onConflict: 'id' });

            if (orgError) {
                return { error: `Insurance record error: ${orgError.message}` };
            }
        }

        return {
            success: true,
            userId,
            credentials: {
                email: data.email,
                password: data.generatedPassword,
                orgId: data.generatedId,
            },
        };
    } catch (err: any) {
        return { error: err.message || 'Unknown error' };
    }
}
