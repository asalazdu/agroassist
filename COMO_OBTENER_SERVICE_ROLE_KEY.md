# 🔑 CÓMO OBTENER LA SERVICE_ROLE KEY DE SUPABASE

## Problema Actual
La migración falló con el error:
```
❌ Error: new row violates row-level security policy for table "usuarios"
```

## ¿Por qué?
El Row Level Security (RLS) está activo y la clave `anon` (pública) no tiene permisos para insertar usuarios directamente.

## Solución: Usar la Service Role Key

### Paso 1: Ir a Supabase Dashboard
```
1. Abre https://supabase.com/dashboard
2. Click en tu proyecto: agroassist
3. En el menú izquierdo, click en "Settings" (⚙️)
4. Click en "API"
```

### Paso 2: Encontrar la Service Role Key
```
En la sección "Project API keys" verás:

📋 Project URL
   https://endtgngduxyxdyponecx.supabase.co

📋 anon / public key (ya la tienes)
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

📋 service_role key ⚠️ ESTA ES LA QUE NECESITAS
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   [Está oculta por seguridad, click en "Reveal" para verla]
```

### Paso 3: Copiar la Service Role Key
```
1. Click en el ícono del ojo 👁️ o en "Reveal" 
2. Click en el ícono de copiar 📋
3. Copia la clave completa (empieza con eyJ...)
```

### Paso 4: Agregar al .env
```
Abre: agroassist-backend/.env

Agrega esta línea (debajo de SUPABASE_KEY):

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZHRnbmdkdXh5eGR5cG9uZWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ1MjEyOCwiZXhwIjoyMDc2MDI4MTI4fQ.hiEWcouibPjVwI4xDV4CLjmUSA1b-dRQIaT3AGGMpfA
```

## Ejemplo de cómo debe quedar tu .env:

```env
# =====================================
# CONFIGURACIÓN DE SUPABASE
# =====================================
SUPABASE_URL=https://endtgngduxyxdyponecx.supabase.co

# Clave pública (para cliente frontend)
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZHRnbmdkdXh5eGR5cG9uZWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTIxMjgsImV4cCI6MjA3NjAyODEyOH0.fpUzNGTuSrmgYlykGA3kC9G-iGrCG1V7AS8vjtaqdBI

# Clave administrativa (NUNCA compartir, solo backend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuZHRnbmdkdXh5eGR5cG9uZWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ1MjEyOCwiZXhwIjoyMDc2MDI4MTI4fQ.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## ⚠️ IMPORTANTE: Seguridad

### Service Role Key - Permisos Totales ⚠️
- ✅ Bypasea Row Level Security (RLS)
- ✅ Acceso completo a todas las tablas
- ✅ Puede insertar/actualizar/eliminar cualquier dato
- ❌ **NUNCA** usar en el frontend
- ❌ **NUNCA** subir a Git
- ✅ Solo usar en backend/scripts administrativos

### Anon Key - Permisos Limitados ✅
- ✅ Segura para usar en frontend
- ✅ Respeta Row Level Security (RLS)
- ✅ Usuarios solo ven sus propios datos
- ✅ Puede subirse a Git (está en código público de Supabase)

## Después de agregar la key:

```bash
# Volver a ejecutar la migración
cd agroassist-backend
node migrateToSupabase.js
```

## Resultado esperado:
```
🚀 INICIANDO MIGRACIÓN DE USUARIOS
📂 Abriendo base de datos SQLite...
✅ Encontrados 1 usuarios en SQLite

📝 Migrando usuario: test@agroassist.com
   ✅ Migrado exitosamente (Nuevo ID: 1)
      Nombre: Usuario Test
      Email: test@agroassist.com
      Rol: usuario

=====================================
📊 RESUMEN DE MIGRACIÓN
✅ Migrados exitosamente: 1
⏭️  Ya existían (omitidos): 0
❌ Errores: 0
📊 Total procesados: 1
🎉 ¡Migración completada con éxito!
```

---

**Una vez que agregues la SERVICE_ROLE_KEY, avísame para continuar.** 🚀
