# 🔍 Debug: Verificación de Credenciales

## 📋 Estado Actual

Ambos servidores están corriendo con logs de debug activados:

✅ **Backend:** `localhost:3000` (accesible vía `10.0.2.2:3000` desde Android)
✅ **Frontend:** `exp://192.168.1.8:8081` en emulador Android

## 🎯 Próximo Paso

**Por favor, intenta hacer login en el emulador:**

```
📧 Email: test@agroassist.com
🔑 Password: test123
```

## 🔎 Qué Voy a Revisar

Los logs del backend ahora mostrarán:

```javascript
📥 LOGIN REQUEST:
  Body completo: { correo: "...", contrasena: "..." }
  Correo: test@agroassist.com
  Contraseña recibida: ***123
```

Esto me permitirá ver:
1. ✅ Si los campos llegan correctamente mapeados
2. ✅ Si el correo es el correcto
3. ✅ Si la contraseña se está enviando
4. ✅ Qué error específico está devolviendo el backend

---

## 🐛 Posibles Problemas

### 1. Usuario no existe en BD
Si el usuario `test@agroassist.com` no existe, necesitamos crearlo.

### 2. Contraseña no coincide
Si la contraseña hasheada no coincide, puede ser que:
- El hash en BD sea diferente
- bcrypt no está comparando correctamente

### 3. Campos llegan undefined
Si `correo` o `contrasena` llegan como `undefined`, significa que el mapeo no está funcionando.

---

## 🔧 Soluciones Preparadas

### Si el usuario no existe:
```javascript
// Crear usuario test
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('test123', 10);
db.query('INSERT INTO usuarios (nombre_completo, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)', 
  ['Usuario Test', 'test@agroassist.com', hash, 2]);
```

### Si la contraseña no coincide:
Verificaré el hash actual y lo regeneraré con la contraseña `test123`.

### Si los campos no llegan:
Revisaré el authService para asegurar que el mapeo esté correcto.

---

**Intenta hacer login y déjame saber qué pasa.** 

Mientras tanto, revisaré los logs del backend para diagnosticar el problema exacto. 🔍
