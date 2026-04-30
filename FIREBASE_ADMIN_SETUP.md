# 🔥 Setup de Firebase para Panel Admin

## 1. Configurar Firebase Authentication

### Paso 1: Habilitar Email/Password en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **Yofre al Toque**
3. En el menú lateral, haz clic en **Authentication**
4. Ve a la pestaña **Sign-in method**
5. Habilita **Email/Password** (click en el método → Enable → Save)

### Paso 2: Crear usuario admin

1. En Firebase Console → Authentication → Users
2. Click en **Add user**
3. Ingresa:
   - **Email**: tu email (ej: `admin@yofre.com`)
   - **Password**: una contraseña segura (mínimo 6 caracteres)
4. Click **Add user**
5. **Copia el User UID** que aparece (lo necesitarás en el siguiente paso)

### Paso 3: Agregar admin a Firestore

1. Ve a **Firestore Database**
2. Click en **+ Start collection**
3. Collection ID: `admins`
4. Document ID: **pega aquí el UID que copiaste**
5. Agrega los siguientes campos:
   ```
   email     (string):  tu@email.com
   nombre    (string):  Tu Nombre
   rol       (string):  admin
   fechaCreacion (timestamp): [auto]
   ```
6. Click **Save**

### Paso 4: Agregar más admins (opcional - máximo 3)

Repite los pasos 2 y 3 para cada admin adicional.

---

## 2. Configurar Reglas de Seguridad Firestore

1. Ve a **Firestore Database** → **Rules**
2. Reemplaza las reglas actuales con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper: verificar si es admin
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Función helper: verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Negocios
    match /negocios/{negocioId} {
      // Leer: solo negocios aprobados son públicos
      allow read: if resource.data.estado == "aprobado" || isAdmin();
      
      // Crear: cualquiera puede crear (siempre con estado pendiente)
      allow create: if request.resource.data.estado == "pendiente";
      
      // Actualizar/eliminar: solo admins
      allow update, delete: if isAdmin();
    }
    
    // Admins
    match /admins/{adminId} {
      // Solo admins pueden leer/escribir
      allow read, write: if isAdmin();
    }
  }
}
```

3. Click **Publish**

---

## 3. Configurar Variables de Entorno en Vercel

Para que el formulario funcione en producción:

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **web**
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables (cópialas desde tu archivo local `web/src/lib/firebase/config.js`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

5. Click **Save**
6. Haz **Redeploy** del proyecto:
   ```bash
   vercel --prod
   ```

---

## 4. Probar el Sistema

### Test Local (Desarrollo)

1. Inicia el servidor local:
   ```bash
   cd web
   npm run dev
   ```

2. Prueba el flujo completo:
   - Ir a `http://localhost:3000/publicar-negocio`
   - Llenar el formulario y enviar
   - Ir a `http://localhost:3000/admin/login`
   - Login con el usuario admin que creaste
   - Aprobar el negocio
   - Verificar que ahora aparece en la home

### Test en Producción

Una vez desplegado:
- URL del sitio: `https://web-phi-seven-77.vercel.app`
- Panel admin: `https://web-phi-seven-77.vercel.app/admin/login`

---

## 5. Resumen de Credenciales

**Email admin:** _____________________  
**Password:** _____________________  
**Total admins:** ___ / 3

---

## ⚠️ Importante

- **Backups**: Firebase hace backups automáticos, pero considera exportar datos regularmente
- **Seguridad**: Cambia las contraseñas admin cada 3-6 meses
- **Límite de admins**: Máximo 3 usuarios, verifica que no haya más en la colección `admins`
