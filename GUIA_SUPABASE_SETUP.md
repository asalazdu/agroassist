# 🚀 GUÍA PASO A PASO: Configurar Base de Datos en Supabase

## 📋 Tabla de Contenido
1. [Acceder al SQL Editor](#paso-1-acceder-al-sql-editor)
2. [Ejecutar el Script](#paso-2-ejecutar-el-script)
3. [Verificar las Tablas](#paso-3-verificar-las-tablas)
4. [Qué se creó](#paso-4-qué-se-creó)

---

## PASO 1: Acceder al SQL Editor

### 1.1 Ir a tu proyecto Supabase
```
1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard
3. Click en tu proyecto: "agroassist-prod" (o el nombre que le pusiste)
```

### 1.2 Abrir SQL Editor
```
En el panel izquierdo, busca y haz click en:
🔧 SQL Editor
```

### 1.3 Crear nueva query
```
1. Click en el botón "+ New Query" (arriba a la derecha)
2. Te abrirá un editor de código SQL vacío
```

---

## PASO 2: Ejecutar el Script

### 2.1 Copiar el SQL
```
1. Abre el archivo: supabase_setup.sql
2. Selecciona TODO el contenido (Ctrl+A)
3. Copia (Ctrl+C)
```

### 2.2 Pegar en Supabase
```
1. En el SQL Editor de Supabase
2. Pega todo el código (Ctrl+V)
3. Deberías ver un script largo con comentarios en español
```

### 2.3 Ejecutar
```
1. Click en el botón "Run" (esquina superior derecha)
   O presiona: Ctrl + Enter
2. Espera 5-10 segundos
3. Verás mensajes de confirmación abajo
```

### 2.4 ¿Qué verás?
Si todo salió bien, verás algo como:
```sql
✅ mensaje: "Script ejecutado exitosamente!"
✅ Lista de tablas creadas:
   - alertas_usuario
   - consultas_chatbot
   - cultivos_usuario
   - fotos_cultivos
   - plagas_colombia
   - precios_agricolas
   - registros_clima
   - roles
   - usuarios
```

---

## PASO 3: Verificar las Tablas

### 3.1 Ver las tablas en Table Editor
```
1. En el panel izquierdo, click en "Table Editor"
2. Deberías ver TODAS las tablas listadas:
   ✅ usuarios
   ✅ roles
   ✅ cultivos_usuario
   ✅ registros_clima
   ✅ consultas_chatbot
   ✅ fotos_cultivos
   ✅ plagas_colombia
   ✅ precios_agricolas
   ✅ alertas_usuario
```

### 3.2 Explorar tabla "usuarios"
```
1. Click en la tabla "usuarios"
2. Verás las columnas:
   - id
   - nombre_completo
   - correo
   - contrasena
   - telefono
   - ubicacion
   - tamaño_finca
   - id_rol
   - intentos_fallidos
   - bloqueado_hasta
   - reset_token
   - reset_token_expiration
   - ultimo_acceso
   - creado_en
   - actualizado_en
3. La tabla está VACÍA por ahora (migraremos datos después)
```

### 3.3 Verificar tabla "roles"
```
1. Click en tabla "roles"
2. Deberías ver 2 registros:
   - id: 1, nombre: "admin"
   - id: 2, nombre: "usuario"
```

### 3.4 Verificar tabla "plagas_colombia"
```
1. Click en tabla "plagas_colombia"
2. Deberías ver 3 plagas de ejemplo:
   - Broca del Café
   - Gota o Gotera
   - Picudo del Plátano
```

---

## PASO 4: Qué se creó

### 📊 Tablas Principales (9 tablas)

#### 1. **usuarios** 👥
```
Almacena información de usuarios
- Datos personales (nombre, correo, teléfono)
- Ubicación y tamaño de finca
- Seguridad (contraseña, intentos fallidos)
- Recuperación de contraseña
```

#### 2. **roles** 🎭
```
Roles del sistema
- admin (administrador)
- usuario (usuario regular)
```

#### 3. **cultivos_usuario** 🌾
```
Cultivos de cada usuario
- Qué cultivo, variedad, área
- Fechas de siembra y cosecha
- Estado (activo, cosechado)
- Ubicación GPS del lote
```

#### 4. **registros_clima** 🌤️
```
Historial de datos climáticos
- Temperatura, humedad, precipitación
- Velocidad del viento, presión
- Por ubicación y fecha
```

#### 5. **consultas_chatbot** 💬
```
Historial de conversaciones
- Pregunta y respuesta
- Modelo usado (GPT-3.5)
- Calificación del usuario
- Categoría (plagas, clima, etc.)
```

#### 6. **fotos_cultivos** 📸
```
Fotos subidas por usuarios
- URL de la imagen
- Análisis por IA
- Plagas/enfermedades detectadas
- Recomendaciones
```

#### 7. **plagas_colombia** 🐛
```
Base de datos de plagas
- Nombre común y científico
- Síntomas y tratamiento
- Cultivos afectados
- Regiones de Colombia
```

#### 8. **precios_agricolas** 💰
```
Precios de productos e insumos
- Nombre del producto
- Precio min/max/promedio
- Ciudad y mercado
- Fecha de registro
```

#### 9. **alertas_usuario** 🔔
```
Notificaciones para usuarios
- Alertas de clima, plagas, precios
- Prioridad (baja, normal, alta)
- Estado (leída/no leída)
```

### 🔒 Seguridad Configurada (RLS)

**Row Level Security activado:**
- ✅ Usuarios solo ven sus propios datos
- ✅ No pueden ver datos de otros usuarios
- ✅ Administradores tienen acceso completo
- ✅ Tablas públicas (plagas, precios) visibles para todos

### ⚡ Features Automáticas

**Triggers creados:**
- ✅ `actualizado_en` se actualiza automáticamente
- ✅ Timestamps con zona horaria
- ✅ Validaciones de email

**Índices creados:**
- ✅ Búsquedas rápidas por correo
- ✅ Búsquedas por fecha
- ✅ Búsquedas por ubicación
- ✅ Mejor rendimiento en queries

**Vistas útiles:**
- ✅ `cultivos_activos_v`: Ver cultivos activos con cálculos
- ✅ `alertas_pendientes_v`: Alertas no leídas ordenadas

---

## ✅ Checklist de Verificación

Marca cada item cuando lo completes:

```
□ Abrí Supabase Dashboard
□ Entré al SQL Editor
□ Copié el contenido de supabase_setup.sql
□ Pegué en el SQL Editor
□ Ejecuté el script (Run)
□ Vi el mensaje "Script ejecutado exitosamente!"
□ Verifiqué que aparecen 9 tablas en Table Editor
□ Verifiqué que tabla "roles" tiene 2 registros
□ Verifiqué que tabla "plagas_colombia" tiene 3 registros
□ La tabla "usuarios" está vacía (esperado)
```

---

## 🚨 Posibles Errores

### Error: "permission denied"
```
Solución: Asegúrate de estar usando el SQL Editor con permisos de admin
No uses el editor de tablas, usa SQL Editor
```

### Error: "relation already exists"
```
Significa que ya ejecutaste el script antes
Solución: Está bien, las tablas ya existen
O puedes borrarlas primero y volver a ejecutar
```

### Error: "syntax error"
```
Verifica que copiaste TODO el archivo completo
No debe faltar ninguna línea
```

---

## 📸 Screenshots de Referencia

### Cómo se ve el SQL Editor:
```
+----------------------------------+
| SQL Editor                    Run|
+----------------------------------+
| -- AGROASSIST - CONFIGURACIÓN   |
| -- ===========================   |
| CREATE TABLE usuarios (         |
|   ...                           |
+----------------------------------+
```

### Cómo se ve Table Editor después:
```
+----------------------------------+
| Tables                          |
+----------------------------------+
| ✓ alertas_usuario               |
| ✓ consultas_chatbot             |
| ✓ cultivos_usuario              |
| ✓ fotos_cultivos                |
| ✓ plagas_colombia               |
| ✓ precios_agricolas             |
| ✓ registros_clima               |
| ✓ roles                    (2)  |
| ✓ usuarios                 (0)  |
+----------------------------------+
```

---

## ➡️ Siguiente Paso

Una vez que confirmes que todas las tablas se crearon correctamente:

**PASO 5: Migrar tus usuarios de SQLite a Supabase**
```
Te ayudaré a exportar tus usuarios actuales
e importarlos a la nueva base de datos
para no perder información
```

---

## 💡 Notas Importantes

1. **No hay vuelta atrás**: Una vez ejecutado, las tablas quedan creadas
2. **Es seguro ejecutar varias veces**: El script tiene `IF NOT EXISTS`
3. **Tus datos actuales están a salvo**: Todavía en SQLite local
4. **Puedes usar ambas**: SQLite y Supabase al mismo tiempo durante la migración

---

## 🆘 ¿Necesitas Ayuda?

Si ves algún error o tienes dudas:
1. Copia el mensaje de error completo
2. Toma screenshot
3. Dime exactamente en qué paso estás

---

**¿Ya ejecutaste el script? Dime si todo salió bien para continuar con la migración de datos.** ✅
