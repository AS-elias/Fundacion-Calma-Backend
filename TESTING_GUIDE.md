# 🚀 Guía de Configuración y Testeo - Backend Fundación Calma

## 1. Variables de Entorno (.env)

Agrega o verifica estos valores en tu archivo `.env`:

```bash
# JWT Configuration
JWT_SECRET=tu-secreto-super-fuerte-aqui-cambiar-en-produccion
JWT_EXPIRATION=24h

# Database
DATABASE_URL=tu-conexion-postgresql

# Email Service
EMAIL_HOST=tu-servidor-smtp
EMAIL_PORT=587
EMAIL_USER=tu-email
EMAIL_PASS=tu-contraseña

# WebRTC TURN Servers (opcional, pero recomendado)
# Formato: turn:servidor:puerto|usuario|contraseña,turn:servidor2:puerto|usuario2|contraseña2
TURN_SERVERS=

# Dominios de email permitidos (opcional)
ALLOWED_EMAIL_DOMAINS=empresa.com,dominio.com
```

---

## 2. Compilar y Ejecutar

```bash
# Desarrollo (con watch)
npm run start:dev

# Construcción production
npm run build
npm run start:prod
```

---

## 3. Testing Endpoints

### 3.1 Autenticación

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre": "Juan Perez",
    "email": "usuario@example.com",
    "rol": "ADMIN",
    "areaDireccionId": null
  }
}
```

#### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### Get Current User
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta esperada:**
```json
{
  "id": 1,
  "nombre": "Juan Perez",
  "email": "usuario@example.com",
  "rol": "ADMIN",
  "areaDireccionId": null,
  "estado": "ACTIVO"
}
```

---

### 3.2 WebRTC ICE Servers

```bash
curl -X GET http://localhost:3000/api/comunicaciones/webrtc/ice-servers
```

**Respuesta esperada:**
```json
{
  "stun": [
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
    "stun:stun2.l.google.com:19302"
  ],
  "turn": []
}
```

---

### 3.3 Socket.IO - Pruebas en Frontend

#### Conexión Básica (JavaScript)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/comunicaciones', {
  auth: {
    token: 'tu_access_token_aqui'
  }
});

// Eventos de conexión
socket.on('connect', () => {
  console.log('✅ Conectado a Socket.io');
});

socket.on('unauthorized', (data) => {
  console.log('❌ No autorizado:', data.message);
});

socket.on('disconnect', () => {
  console.log('🔌 Desconectado');
});
```

#### Crear Canal
```javascript
socket.emit('createChannel', {
  nombre: 'Mi Canal',
  descripcion: 'Descripción',
  esGrupo: true,
  participanteIds: [1, 2, 3]
}, (response) => {
  console.log('Respuesta:', response);
  // { success: true, data: { canalId: 1, ... } }
});
```

#### Enviar Mensaje
```javascript
socket.emit('sendMessage', {
  canalId: 1,
  remitenteId: 1,
  contenido: 'Hola a todos!',
  tipo: 'text'
}, (response) => {
  console.log('Mensaje enviado:', response);
  // { success: true, data: { id: 1, messageId: 1, ... } }
});
```

#### Obtener Canales del Usuario
```javascript
socket.emit('getUserChannels', {
  usuarioId: 1
}, (response) => {
  console.log('Mis canales:', response);
  // { success: true, data: [...] }
});
```

#### Iniciar Llamada
```javascript
socket.emit('callOffer', {
  targetUserId: 2,
  fromUserId: 1,
  fromName: 'Juan',
  callType: 'video',
  offer: rtcOffer,
  canalId: 1
}, (response) => {
  console.log('Llamada iniciada:', response);
  // { success: true, callId: 'call_123' }
});
```

#### Eventos que Recibirás
```javascript
// Nuevo mensaje en canal
socket.on('newMessage', (message) => {
  console.log('Nuevo mensaje:', message);
});

// Usuario está online
socket.on('userOnline', (data) => {
  console.log('Usuario online:', data.usuarioId);
});

// Usuario está offline
socket.on('userOffline', (data) => {
  console.log('Usuario offline:', data.usuarioId);
});

// Canal fue creado
socket.on('channelCreated', (channel) => {
  console.log('Nuevo canal:', channel);
});

// Llamada entrante
socket.on('callOffer', (callData) => {
  console.log('Llamada entrante:', callData.fromName);
});

// Llamada finalizada
socket.on('endCall', (data) => {
  console.log('Llamada finalizada:', data.callId);
});
```

---

## 4. Códigos de Error HTTP

### 401 Unauthorized
- Token inválido o expirado
- Token no proporcionado

```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "2026-04-15T10:30:00.000Z",
  "path": "/api/auth/me"
}
```

### 403 Forbidden
- Usuario sin permisos

```json
{
  "success": false,
  "message": "Acceso denegado: Usuario no autorizado",
  "errorCode": "FORBIDDEN",
  "timestamp": "2026-04-15T10:30:00.000Z",
  "path": "/api/comunidad/solicitudes-contacto/1"
}
```

### 400 Bad Request
- Datos inválidos

```json
{
  "success": false,
  "message": "canalId inválido",
  "errorCode": "BAD_REQUEST",
  "timestamp": "2026-04-15T10:30:00.000Z",
  "path": "/api/comunicaciones/channels/abc"
}
```

### 404 Not Found
- Recurso no existe

```json
{
  "success": false,
  "message": "Canal no encontrado",
  "errorCode": "NOT_FOUND",
  "timestamp": "2026-04-15T10:30:00.000Z",
  "path": "/api/comunicaciones/channels/999"
}
```

---

## 5. Checklist de Verificación

- ✅ JWT expira en 24h
- ✅ Refresh token funciona y dura 7 días
- ✅ GET /api/auth/me devuelve datos del usuario
- ✅ Socket.io valida token en handshake
- ✅ Todos los listeners Socket.io retornan respuestas
- ✅ Broadcast events se envían correctamente
- ✅ WebRTC ICE servers endpoint funciona
- ✅ Errors tienen formato consistente
- ✅ Status codes correctos (401, 403, 400, 404, 500)

---

## 6. Próximos Pasos (Frontend)

1. **Guardar tokens**
   - Almacenar `access_token` en memoria o sessionStorage
   - Almacenar `refresh_token` de forma segura (HTTPOnly cookie si es posible)

2. **Interceptor de requests**
   - Agregar `Authorization: Bearer access_token` a todas las requests HTTP
   - Manejar respuesta 401 para refrescar token automáticamente

3. **Conexión Socket.io**
   - Usar el `access_token` en el handshake
   - Reconectar si el token se vence

4. **WebRTC Config**
   - Obtener `iceServers` del endpoint
   - Pasar a `RTCPeerConnection`

5. **Real-time UI**
   - Escuchar eventos Socket.io
   - Actualizar UI cuando llegan mensajes, usuarios entran/salen, llamadas, etc.

---

**Actualizado**: 15 de Abril 2026  
**Estado**: ✅ Listo para testing
