// Prueba: node test/test-google-script.js
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

const googleScriptUrl = process.env.GOOGLE_SCRIPT_EMAIL_URL;

async function testGoogleScript() {
  console.log('\n=== TEST: Google Apps Script (correos) ===\n');

  if (!googleScriptUrl) {
    console.log('❌ Define GOOGLE_SCRIPT_EMAIL_URL en .env');
    console.log('   Guía: scripts/DEPLOY-GOOGLE-EMAIL.md');
    process.exit(1);
  }

  // 1) GET — debe responder JSON si el despliegue es público
  console.log('1) GET (debe ser JSON público):', googleScriptUrl);
  const getRes = await fetch(googleScriptUrl);
  const getText = await getRes.text();
  console.log('   Status:', getRes.status, getRes.statusText);
  console.log('   Body:', getText.slice(0, 200));
  if (getRes.status === 403 || getText.includes('Acceso denegado')) {
    console.log('\n❌ 403: En Apps Script → Implementar → acceso "Cualquier persona"');
    process.exit(1);
  }

  const testTo = process.env.EMAIL_TEST_TO || process.env.EMAIL_USER;
  if (!testTo) {
    console.log('\n⚠️  Sin EMAIL_TEST_TO ni EMAIL_USER; solo se probó GET.');
    return;
  }

  const payload = {
    to: testTo,
    subject: 'Test Email from Backend',
    html: '<p>Este es un test del Google Apps Script</p>',
    text: 'Este es un test del Google Apps Script',
  };

  try {
    console.log('\n2) POST envío real a:', testTo);
    console.log('   Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(googleScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log('\nRespuesta (texto):', responseText);

    // Intentar parsear como JSON
    try {
      const data = JSON.parse(responseText);
      console.log('\nRespuesta (JSON):', JSON.stringify(data, null, 2));
    } catch {
      console.log('\nNo se pudo parsear como JSON');
    }

    if (!response.ok) {
      console.log('\n❌ ERROR: Google Script retornó un error HTTP');
    } else {
      console.log('\n✅ SUCCESS: Google Script respondió correctamente');
    }

  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.log('Stack:', error.stack);
  }
}

testGoogleScript();
