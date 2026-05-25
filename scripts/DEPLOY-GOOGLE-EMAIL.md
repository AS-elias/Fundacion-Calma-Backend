# Correos con Google Apps Script (Render Free)

## Variables en Render (Environment)

```env
EMAIL_PROVIDER=google-script
GOOGLE_SCRIPT_EMAIL_URL=https://script.google.com/macros/s/TU_ID/exec
EMAIL_FROM=Fundación Calma <tu@gmail.com>
APP_URL=https://fundacion-calma-fronted.onrender.com
```

Tras guardar, Render **reinicia** el servicio. Haz **deploy** del último código de `main` si los logs siguen diciendo "Transporter not configured" (eso es una versión antigua).

## Comprobar

```bash
node test/test-google-script.js
```

Al arrancar el backend debe verse: `Provider activo: google-script | script=configurada`.
