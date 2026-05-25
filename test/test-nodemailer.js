// Test de Nodemailer con credenciales de Gmail
require('dotenv').config();

const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('\n=== TEST: Nodemailer con Gmail SMTP ===\n');

  const emailHost = process.env.EMAIL_HOST;
  const emailPort = parseInt(process.env.EMAIL_PORT);
  const emailSecure = process.env.EMAIL_SECURE === 'true';
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailFrom = process.env.EMAIL_FROM;

  console.log('Configuración SMTP:');
  console.log(`- HOST: ${emailHost}`);
  console.log(`- PORT: ${emailPort}`);
  console.log(`- SECURE: ${emailSecure}`);
  console.log(`- USER: ${emailUser}`);
  console.log(`- FROM: ${emailFrom}`);
  console.log('');

  if (!emailHost || !emailUser || !emailPass) {
    console.log('❌ ERROR: Configuración SMTP incompleta en .env');
    return;
  }

  try {
    // Crear transporter
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verificar conexión
    console.log('Verificando conexión al servidor SMTP...');
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente\n');

    // Enviar email de prueba
    console.log('Enviando email de prueba...');
    const result = await transporter.sendMail({
      from: emailFrom,
      to: emailUser, // Enviar a la misma dirección
      subject: '🧪 Test Email from Backend - Fundación Calma',
      text: 'Este es un email de prueba del sistema de Fundación Calma con Nodemailer.',
      html: `
        <h2>🧪 Test Email - Fundación Calma</h2>
        <p>Este es un email de prueba del sistema de backend.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p>Si recibiste este email, significa que el sistema de envío de correos <strong>está funcionando correctamente</strong>.</p>
        <hr>
        <p>Equipo Fundación Calma</p>
      `,
    });

    console.log('✅ Email enviado exitosamente!');
    console.log(`\n📧 Detalles del envío:`);
    console.log(`- MessageID: ${result.messageId}`);
    console.log(`- Response: ${result.response}`);

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    if (error.code === 'EAUTH') {
      console.log('\n⚠️ Error de autenticación. Verifica:');
      console.log('   - EMAIL_USER es correcto');
      console.log('   - EMAIL_PASS es una contraseña de aplicación (no la contraseña de Google)');
      console.log('   - La cuenta tiene autenticación de 2 factores activada');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n⚠️ Host no encontrado. Verifica EMAIL_HOST');
    }
  }
}

testEmail();
