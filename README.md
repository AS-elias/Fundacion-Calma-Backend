# 🏛️ Fundación Calma - Backend Comercial

Este es el núcleo del sistema de la Fundación Calma, desarrollado con una arquitectura escalable para gestionar inicialmente el área Comercial, con capacidad de expandirse a las áreas Clínica y Educativa.

## 🚀 Tecnologías Principales
* **Framework:** [NestJS](https://nestjs.com/) (Node.js v20)
* **Base de Datos:** [PostgreSQL 15](https://www.postgresql.org/) (Elegido por su flexibilidad con JSONB)
* **ORM:** [Prisma v6](https://www.prisma.io/) (Manejo de base de datos con TypeSafe)
* **Contenedores:** [Docker](https://www.docker.com/) (Para asegurar que el entorno sea idéntico para los 3 devs)

---

## 🛠️ Configuración del Entorno (Para nuevos devs)

Si acabas de clonar el repositorio, sigue estos pasos en orden:

1.  **Instalar dependencias (limpio y reproducible):**
    ```bash
    npm install
    npm install @nestjs/config
    npm install @nestjs/jwt
    npm ci
    ```

2.  **Configurar variables de entorno:**
    * Copia el archivo `.env.example` y renómbralo a `.env`.
    * Asegúrate de que la `DATABASE_URL` coincida con tus credenciales de Docker.
    * Opcional: para restringir dominios de email en registro, usa:
    ```bash
    ALLOWED_EMAIL_DOMAINS=calma.org,gmail.com
    ```

3.  **Levantar la infraestructura (Docker):**
    * Abre Docker Desktop y espera a que esté en verde.
    * Ejecuta:
    ```bash
    docker-compose up -d
    ```

4.  **Sincronizar la Base de Datos (Prisma):**
    ```bash
    npx prisma migrate dev
    npx prisma generate
    npx prisma db seed
    ```

5.  **Validar que todo compila:**
    ```bash
    npm run build
    ```

---

## ✅ Checklist Antes de Merge a `main`

Para evitar el clasico "en mi maquina funciona":

1.  **Traer cambios de main:**
    ```bash
    git fetch origin
    ```

2.  **Rebase tu rama sobre main:**
    ```bash
    git rebase origin/main
    ```

3.  **Instalar dependencias:**
    ```bash
    npm ci
    ```

4.  **Regenerar Prisma:**
    ```bash
    npx prisma generate
    ```

5.  **Validar compilación:**
    ```bash
    npm run build
    ```

6.  **Revisar código:**
    ```bash
    npm run lint
    ```

7.  **Ejecutar tests:**
    ```bash
    npm run test
    ```

8.  **Smoke test de Auth (manual):**
    * `POST /auth/login` con credenciales validas.
    * `GET /auth/perfil` sin token → `401`.
    * `GET /auth/perfil` con token → `200`.
    * `POST /auth/register` con usuario no admin → `403`.

9.  **Revisar archivos a NO subir:**
    * `.env` (debe estar en `.gitignore`)
    * `dist/` (generado en build)
    * archivos temporales

10. **Si cambiaste `schema.prisma`:**
    ```bash
    npx prisma migrate dev --name descripcion
    ```
    → Generará carpeta en `prisma/migrations/` que DEBE subirse.

---

## 🔀 Workflow de Ramas (Obligatorio para el equipo)

**NUNCA commiteamos directamente en `main`**. Usamos ramas de feature.

**1. Crear rama:**
```bash
git checkout -b feature/nombre-descriptivo
```

**2. Desarrollar (en tu rama):**
```bash
npm run start:dev
```
→ Prueba tu código localmente.

**3. Validar antes de commit:**
```bash
npm run build
```

```bash
npm run lint
```

**4. Commitear:**
```bash
git add .
```

```bash
git commit -m "feat(auth): tu cambio"
```

**5. Traer cambios de main (por si otros mergieron):**
```bash
git fetch origin
```

**6. Rebase tu rama:**
```bash
git rebase origin/main
```

**7. Push a tu rama:**
```bash
git push origin feature/nombre-descriptivo
```
→ Ve a GitHub y crea Pull Request.

**8. Después que mergeen tu PR, vuelve a main:**
```bash
git checkout main
```

**9. Baja cambios:**
```bash
git pull origin main
```

**10. Elimina tu rama local:**
```bash
git branch -d feature/nombre-descriptivo
```

---

**🚨 Si accidentalmente editaste `main`:**

**Paso 1: Guardar tus cambios:**
```bash
git stash
```

**Paso 2: Sincronizar main:**
```bash
git pull origin main
```

**Paso 3: Crear rama propia:**
```bash
git checkout -b feature/mi-cambio
```

**Paso 4: Restaurar tus cambios:**
```bash
git stash pop
```

---

## ⚡ Comandos de Uso Diario

### 🐳 Docker (Infraestructura - Base de Datos)

* `docker-compose up -d` 
  - **Para qué:** Enciende PostgreSQL en segundo plano (necesario para que el backend pueda conectarse).
  - **Cuándo:** Al iniciar el día de trabajo.

* `docker-compose stop` 
  - **Para qué:** Apaga PostgreSQL sin borrar los datos (puedes volver a encender con `up`).
  - **Cuándo:** Al terminar de trabajar o cambiar de proyecto.

* `docker-compose down` 
  - **Para qué:** Elimina completamente los contenedores y datos (cuidado, data se pierde).
  - **Cuándo:** Si quieres resetear todo a cero.

### ◭ Prisma (Gestión de Base de Datos)

* `npx prisma generate` 
  - **Para qué:** Actualiza el cliente Prisma para que el IDE te muestre autocompletado de tablas/campos.
  - **Cuándo:** Después de clonar, después de migrar, siempre que veas errores de "tabla no existe".

* `npx prisma migrate dev --name descripcion_del_cambio` 
  - **Para qué:** Crea una migración nueva cuando modificas `schema.prisma` (agregar tabla, campo, etc).
  - **Cuándo:** Cuando cambias la estructura de BD.
  - **Ejemplo:** `npx prisma migrate dev --name add_email_to_usuarios`

* `npx prisma db seed` 
  - **Para qué:** Correr el archivo `prisma/seed.ts` para cargar datos iniciales (roles, usuarios de prueba).
  - **Cuándo:** Después de clonar o si necesitas resetear datos de desarrollo.

* `npx prisma studio` 
  - **Para qué:** Abre un panel visual en `localhost:5555` para ver/editar datos como en Excel.
  - **Cuándo:** Para debuggear o verificar datos sin escribir queries SQL.

### 💻 NestJS (Tu Backend)

* `npm run start:dev` 
  - **Para qué:** Inicia el servidor con "hot reload" (se recarga automáticamente cuando cambias código).
  - **Cuándo:** Siempre que estés desarrollando.
  - **Parada:** Ctrl+C en la terminal.

* `npm run build` 
  - **Para qué:** Compila TypeScript a JavaScript listo para producción (también valida errores).
  - **Cuándo:** Antes de hacer commit, para validar que no hay errores.

* `npm run lint` 
  - **Para qué:** Revisa que el código siga las reglas de ESLint (formato, best practices).
  - **Cuándo:** Antes de hacer commit, para asegurar consistencia.

* `npm run format` 
  - **Para qué:** Formatea automáticamente el código con Prettier (indentación, espacios, etc).
  - **Cuándo:** Si el linter se queja de formato, ejecuta esto.

* `npm run test` 
  - **Para qué:** Ejecuta tests unitarios.
  - **Cuándo:** Cuando hayas agregado tests (por ahora no muchos).

---

### 📦 Dependencias Clave del Proyecto (Referencia)

Si estás construyendo desde cero o necesitas reinstalar los módulos centrales:

**Autenticación y Seguridad (Login, JWT, Passwords):**
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

**Comunicaciones y Chat (WebSockets):**
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

---


## 📂 Estructura del Proyecto
* `/src`: Código fuente de la lógica de negocio (NestJS).
* `/prisma`: Esquemas y migraciones de la base de datos.
* `docker-compose.yml`: Configuración de los servicios (DB, API).
* `.env`: Credenciales sensibles (NUNCA subir a GitHub).

---

## 🤝 Reglas del Equipo de 3
1.  **Nunca subir el `.env`**: El archivo está en el `.gitignore` por seguridad.
2.  **Migraciones**: Si cambias una tabla, ejecuta `migrate dev` y sube la carpeta `prisma/migrations` resultante para que tus compañeros se actualicen.
3.  **Versiones**: Mantener siempre Node v20 y Prisma v6 para evitar conflictos de compatibilidad.

---
*Nota: Configuración de despliegue dual (Render + GitHub) habilitada correctamente.*