# Backend Implementation Checklist

## Estado de Implementación - 15 de Abril 2026

### ✅ COMPLETADO

#### 1. AUTENTICACIÓN & TOKEN JWT
- **Token Duration**: `1h` → `24h` ✅
  - Actualizado en `src/modules/auth/auth.module.ts`
  - Actualizado en `src/modules/comunicaciones/comunicaciones.module.ts`
  - Signops: `signOptions: { expiresIn: '24h' }`

- **Refresh Token**: ✅
  - Implementado método `refreshToken()` en `AuthService`
  - Refresh token duration: `7 días`
  - Endpoint: `POST /api/auth/refresh`
    - Body: `{ refresh_token: "..." }`
    - Respuesta: `{ access_token: "...", refresh_token: "..." }`

- **Endpoint GET /api/auth/me**: ✅
  - Protegido con `@UseGuards(JwtAuthGuard)`
  - Devuelve: `{ id, nombre, email, rol, areaDireccionId, estado }`

---

### ✅ WEBSOCKET / SOCKET.IO

#### Listeners Implementados (con callbacks/respuestas)

1. **Gestión de Canales**
   - ✅ `createChannel` → callback: `{ success: true, channel: {...} }`
   - ✅ `joinChannel` → callback: `{ success: true, data: {...} }`
   - ✅ `leaveChannel` → callback: `{ success: true }`
   - ✅ `deleteChannel` → callback: `{ success: true }`
   - ✅ `updateChannel` → callback: `{ success: true, data: {...} }`
   - ✅ `addParticipant` → callback: `{ success: true }`
   - ✅ `removeParticipant` → callback: `{ success: true }`

2. **Mensajes**
   - ✅ `sendMessage` → callback: `{ success: true, messageId, timestamp }`
     - Broadcast: `newMessage` a todos en el canal
   - ✅ `getRecentMessages` → callback: `{ success: true, data: [...] }`
   - ✅ `editMessage` → callback: `{ success: true }`
   - ✅ `deleteMessage` → callback: `{ success: true }`

3. **Reacciones**
   - ✅ `addReaction` → callback: `{ success: true }`
   - ✅ `removeReaction` → callback: `{ success: true }`
   - ✅ `getReactions` → callback: `{ success: true, data: [...] }`

4. **Canales de Usuario**
   - ✅ `getUserChannels` → callback: `{ success: true, data: [...] }`
   - ✅ `getConnectedUsers` → devuelve usuarios conectados

5. **Llamadas (WebRTC)**
   - ✅ `callOffer` → callback: `{ success: true, callId: "..." }`
   - ✅ `callAnswer` → callback: `{ success: true }`
   - ✅ `endCall` → callback: `{ success: true, callId: "..." }`
   - ✅ `iceCandidate` → forwarding para todos
   - ⏳ Nota: Usar `offerSDP` y `answerSDP` en el cliente

6. **Presencia**
   - ✅ `getConnectedUsers` → devuelve lista de usuarios online
   - ✅ Broadcast: `userOnline` en conexión
   - ✅ Broadcast: `userOffline` en desconexión

#### Broadcast Events (para UI sincronizada)
- ✅ `newMessage` → cuando usuario recibe mensaje
- ✅ `channelCreated` → a todos los participantes
- ✅ `userJoinedChannel` → notifica entrada
- ✅ `userLeftChannel` / `participantRemoved` → notifica salida
- ✅ `onlineStatusChanged` → via `userOnline` / `userOffline`
- ✅ `callOffer` → notifica receptor de llamada entrante
- ✅ `endCall` → notifica finalización

---

### ✅ WEBRTC / LLAMADAS

#### Servidores ICE
- **Endpoint**: `GET /api/comunicaciones/webrtc/ice-servers`
- **Respuesta**:
  ```json
  {
    "stun": [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302"
    ],
    "turn": [
      {
        "urls": "turn:...",
        "username": "...",
        "credential": "..."
      }
    ]
  }
  ```

- **Configuración TURN**: Via variable de entorno `TURN_SERVERS`
  - Formato: `turn:host:port|username|credential,turn:host2:port|username2|credential2`

---

### ✅ API REST (HTTP)

#### Autenticación
- ✅ `POST /api/auth/login` → `{ access_token, refresh_token, usuario }`
- ✅ `POST /api/auth/refresh` → `{ access_token, refresh_token }`
- ✅ `GET /api/auth/me` → `{ id, nombre, email, rol, areaDireccionId }`

#### Comunidad
- ✅ `GET /api/comunidad/contactos` → lista de contactos
- ✅ `GET /api/comunidad/contactos/buscar?q=...` → búsqueda
- ✅ `GET /api/comunidad/areas` → áreas disponibles
- ✅ `GET /api/comunidad/solicitudes-contacto/recibidas` → solicitudes recibidas
- ✅ `GET /api/comunidad/solicitudes-contacto/enviadas` → solicitudes enviadas
- ✅ `POST /api/comunidad/solicitudes-contacto` → enviar solicitud
- ✅ `PATCH /api/comunidad/solicitudes-contacto/:id/aceptar` → aceptar
- ✅ `PATCH /api/comunidad/solicitudes-contacto/:id/rechazar` → rechazar

#### Comunicaciones
- ✅ `POST /api/comunicaciones/channels` → crear canal
- ✅ `GET /api/comunicaciones/channels/:id/info` → info del canal
- ✅ `PATCH /api/comunicaciones/channels/:id` → actualizar canal
- ✅ `DELETE /api/comunicaciones/channels/:id` → eliminar canal
- ✅ `POST /api/comunicaciones/channels/:id/files` → subir archivo
- ✅ `POST /api/comunicaciones/messages/:id/reactions` → agregar reacción
- ✅ `GET /api/comunicaciones/webrtc/ice-servers` → configuración WebRTC

---

### ✅ TOKEN VALIDATION EN WEBSOCKET

- ✅ Socket.io valida token en handshake
  - Conecta vía auth.token en headers
  - Rechaza con error 'Token inválido' si falla
  - Usuario almacenado en `socket.data.user`

---

### ⏳ VERIFICATIONS PENDIENTES

1. **Socket.io Callback Pattern**
   - Los handlers retornan data (NestJS lo convierte automáticamente en callbacks)
   - Patrón: `return { success: true, data: {...} }`
   - Equivalente a: `callback({ success: true, data: {...} })`

2. **Error Handling**
   - Verificar que todos los endpoints devuelvan formato consistente:
     ```json
     {
       "success": false,
       "message": "Descripción del error",
       "errorCode": "ERROR_NAME"
     }
     ```

3. **Status Codes**
   - 401 Unauthorized → Token inválido/expirado
   - 403 Forbidden → Sin permisos
   - 400 Bad Request → Datos inválidos  
   - 404 Not Found → Recurso no existe
   - 500 Internal Server Error → Error del servidor

---

## Variables de Entorno Recomendadas

```bash
JWT_SECRET=your-secret-key-here
TURN_SERVERS=turn:turnserver.com:3478|username|password
ALLOWED_EMAIL_DOMAINS=empresa.com,dominio.com
```

---

## Próximos Pasos

1. ✅ Cambiar duración del token JWT (24h)
2. ✅ Implementar refresh token endpoint
3. ✅ Agregar endpoint GET /api/auth/me
4. ✅ Configurar endpoints WebRTC ICE servers
5. ⏳ Revisar error handling en todos los endpoints
6. ⏳ Agregar validaciones adicionales
7. ⏳ Testing E2E de flujos principales

---

**Fecha**: 15 de Abril 2026  
**Status**: ✅ 95% Completado - Listo para testing
