/**
 * Fundación Calma — envío de correos vía Gmail (MailApp)
 *
 * Despliegue (obligatorio):
 * 1. script.google.com → Nuevo proyecto → pegar este código
 * 2. Implementar → Nueva implementación → Aplicación web
 * 3. Ejecutar como: Yo (cuenta Gmail de la fundación)
 * 4. Quién tiene acceso: Cualquier persona  ← sin esto el backend recibe 403
 * 5. Copiar la URL que termina en /exec → GOOGLE_SCRIPT_EMAIL_URL
 */

function doGet() {
  return jsonResponse({
    ok: true,
    service: 'Fundación Calma Email API',
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'Cuerpo JSON vacío' });
    }

    var data = JSON.parse(e.postData.contents);
    var to = (data.to || '').toString().trim();
    var subject = (data.subject || '').toString().trim();
    var html = (data.html || '').toString();
    var text = (data.text || '').toString();
    var fromLabel = (data.from || 'Fundación Calma').toString();

    if (!to || !subject) {
      return jsonResponse({ ok: false, error: 'Faltan campos: to, subject' });
    }

    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: html || text,
      body: text || html,
      name: fromLabel,
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : String(err),
    });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
