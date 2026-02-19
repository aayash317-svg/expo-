// Fix admin credentials
const URL = 'https://epbxjdzviyyaiwbijmjn.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYnhqZHp2aXl5YWl3YmlqbWpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI0MDE4NiwiZXhwIjoyMDg0ODE2MTg2fQ.AfdYkSczE-wfDqnVtuPpQ5tf4AVkoUxPk91FqfoSFNA';
const h = { 'Authorization': `Bearer ${KEY}`, 'apikey': KEY, 'Content-Type': 'application/json' };

async function run() {
    // List users
    const r = await fetch(`${URL}/auth/v1/admin/users`, { headers: h });
    const d = await r.json();
    const users = d.users || [];
    const admin = users.find(u => u.email === 'aayash317@gmail.com');

    if (admin) {
        console.log('Found user:', admin.id);
        // Update password and confirm
        await fetch(`${URL}/auth/v1/admin/users/${admin.id}`, { method: 'PUT', headers: h, body: JSON.stringify({ password: 'dhilshath123', email_confirm: true, user_metadata: { role: 'admin', full_name: 'Admin' } }) });
        // Update profile role to admin
        await fetch(`${URL}/rest/v1/profiles?id=eq.${admin.id}`, { method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ role: 'admin' }) });
        console.log('Updated to admin role with password: dhilshath123');
    } else {
        console.log('Creating admin user...');
        const cr = await fetch(`${URL}/auth/v1/admin/users`, { method: 'POST', headers: h, body: JSON.stringify({ email: 'aayash317@gmail.com', password: 'dhilshath123', email_confirm: true, user_metadata: { role: 'admin', full_name: 'Admin' } }) });
        const cd = await cr.json();
        if (cr.ok) {
            console.log('Created:', cd.id);
            await fetch(`${URL}/rest/v1/profiles`, { method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ id: cd.id, full_name: 'Admin', role: 'admin', email: 'aayash317@gmail.com' }) });
            console.log('Profile created');
        } else { console.log('Error:', JSON.stringify(cd)); }
    }
    console.log('\nAdmin login: aayash317@gmail.com / dhilshath123');
}
run().catch(console.error);
