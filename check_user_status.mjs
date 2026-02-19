
const URL = 'https://epbxjdzviyyaiwbijmjn.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnhqZHp2aXl5YWl3YmlqbWpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI0MDE4NiwiZXhwIjoyMDg0ODE2MTg2fQ.AfdYkSczE-wfDqnVtuPpQ5tf4AVkoUxPk91FqfoSFNA';

async function checkUser() {
    const email = 'insurance1222@gmail.com';

    console.log(`Checking status for ${email}...`);

    // Check Auth
    const authRes = await fetch(`${URL}/auth/v1/admin/users`, {
        headers: {
            'Authorization': `Bearer ${KEY}`,
            'apikey': KEY
        }
    });
    const authData = await authRes.json();
    const user = authData.users?.find(u => u.email === email);

    if (user) {
        console.log('Auth User Found:');
        console.log(`- ID: ${user.id}`);
        console.log(`- Metadata: ${JSON.stringify(user.user_metadata)}`);

        // Check Profile
        const profileRes = await fetch(`${URL}/rest/v1/profiles?id=eq.${user.id}`, {
            headers: {
                'Authorization': `Bearer ${KEY}`,
                'apikey': KEY
            }
        });
        const profileData = await profileRes.json();
        console.log('Profile:', JSON.stringify(profileData));

        // Check Insurance Provider
        const provRes = await fetch(`${URL}/rest/v1/insurance_providers?id=eq.${user.id}`, {
            headers: {
                'Authorization': `Bearer ${KEY}`,
                'apikey': KEY
            }
        });
        const provData = await provRes.json();
        console.log('Insurance Provider:', JSON.stringify(provData));
    } else {
        console.log('User not found in Auth.');
    }
}

checkUser().catch(console.error);
