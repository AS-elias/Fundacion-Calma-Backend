(async () => {
  const base = 'http://localhost:3005/api';
  try {
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@calma.org', password: 'password123' }),
    });
    const loginText = await loginRes.text();
    console.log('--- LOGIN ADMIN RESPONSE ---');
    console.log(loginText);
    let token = '';
    try {
      const lj = JSON.parse(loginText);
      token = lj.access_token || lj.token || lj.accessToken || '';
    } catch (e) {}
    if (!token) {
      console.error('No token obtenido. Asegúrate que la API esté corriendo en http://localhost:3005');
      process.exit(1);
    }

    console.log('\n--- /api/dashboard/admin ---');
    const adminRes = await fetch(`${base}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const adminJson = await adminRes.json().catch(() => null);
    console.log(JSON.stringify(adminJson, null, 2));
  } catch (err) {
    console.error('Error ejecutando las peticiones:', err.message || err);
    process.exit(1);
  }
})();
