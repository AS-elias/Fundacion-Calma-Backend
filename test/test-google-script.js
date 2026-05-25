// Script para probar la comunicación con Google Apps Script
const googleScriptUrl = 'https://script.google.com/macros/s/AKfycby4Aj0TYfquft1m0r49njMtk5tb5J52OivWgwqG4Ki-WfLsBDEooR1j9Arhu0BBtpyXhQ/exec';

async function testGoogleScript() {
  console.log('\n=== TEST: Enviando solicitud a Google Apps Script ===\n');

  const payload = {
    to: 'test@example.com',
    subject: 'Test Email from Backend',
    html: '<p>Este es un test del Google Apps Script</p>',
    text: 'Este es un test del Google Apps Script',
  };

  try {
    console.log('Enviando payload:', JSON.stringify(payload, null, 2));
    console.log('\nURL:', googleScriptUrl);
    console.log('\n---\n');

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
