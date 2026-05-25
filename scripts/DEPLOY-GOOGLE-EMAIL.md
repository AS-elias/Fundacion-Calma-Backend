# Correos con Google Apps Script (gratis, sin dominio)

Render Free **no permite SMTP**. Esta guía usa tu Gmail por HTTPS.

## 1. Crear el script

1. Entra con la cuenta Gmail de la fundación: https://script.google.com
2. **Nuevo proyecto**
3. Borra el código por defecto y pega todo el archivo `google-apps-script-email.gs` de esta carpeta
4. Guarda (Ctrl+S). Nombre sugerido: `Fundacion Calma Email`

## 2. Probar en el editor (opcional)

1. Menú **Ejecutar** → función `doGet` → Autorizar permisos de Gmail cuando pida
2. **Ver** → **Registros** debe mostrar sin errores

## 3. Publicar como aplicación web (paso crítico)

1. **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. **Ejecutar como:** Yo (`ju.arango.fcalma@gmail.com` o la cuenta que envía)
4. **Quién tiene acceso:** **Cualquier persona**  
   - Si pones "Solo yo", el backend en Render recibe **403 Acceso denegado**
5. **Implementar** → copia la URL que termina en **`/exec`** (no uses la URL de `/dev` ni de biblioteca)

Cada vez que cambies el código, crea **Nueva implementación** o **Administrar implementaciones** → editar → **Nueva versión** → desplegar, y actualiza la URL si cambia.

## 4. Probar la URL

En el navegador abre:

```
https://script.google.com/macros/s/TU_ID/exec
```

Debe verse JSON parecido a:

```json
{"ok":true,"service":"Fundación Calma Email API"}
```

Si ves "Necesitas acceso", el despliegue **no** está en "Cualquier persona".

## 5. Variables en Render y en `.env` local

```env
EMAIL_PROVIDER=google-script
GOOGLE_SCRIPT_EMAIL_URL=https://script.google.com/macros/s/TU_ID/exec
EMAIL_FROM=Fundación Calma <ju.arango.fcalma@gmail.com>
APP_URL=https://fundacion-calma-fronted.onrender.com
```

No hace falta `EMAIL_HOST` ni `EMAIL_PASS` en producción.

## 6. Probar desde el backend

```bash
node test/test-google-script.js
```

Debe mostrar status 200 y `ok: true`.

## Límites Gmail (gratis)

- ~100–500 correos/día según cuenta (límite de Google)
- Suficiente para usuarios nuevos y recuperar contraseña de una fundación
