
# 🌱 AgroAssist - Proyecto Completo

Sistema completo de asistencia agrícola inteligente para Colombia.

## 📋 Resumen del Proyecto

AgroAssist es una aplicación completa que incluye:

### 🔙 Backend (Node.js/Express)
- **Ubicación**: `agroassist-backend/`
- **Tecnologías**: Node.js, Express, MySQL, JWT
- **Funcionalidades**:
  - Autenticación de usuarios
  - APIs de plagas especializadas para Colombia
  - Integración con APIs científicas gratuitas (GBIF, iNaturalist, USDA)
  - Información de cultivos colombianos
  - Sistema bilingüe (Español/Inglés)

### 📱 Frontend Mobile (React Native)
- **Ubicación**: `agroassist-frontend/`
- **Tecnologías**: React Native, React Navigation, Material Icons
- **Funcionalidades**:
  - Aplicación móvil completa
  - Sistema de autenticación
  - Consulta de plagas y cultivos
  - Precios de mercado simulados
  - Planes de manejo integrado
  - Diseño responsivo con tema agrícola

## 🚀 Configuración Rápida

### 1. Backend
```bash
cd agroassist-backend
npm install
# Configurar base de datos MySQL
# Ejecutar scripts SQL en guia del proyecto/Script/
npm start
```

### 2. Frontend
```bash
cd agroassist-frontend
npm install
# Para Android:
npx react-native run-android
# Para iOS (solo macOS):
cd ios && pod install && cd ..
npx react-native run-ios
```

## 📁 Estructura Completa

```
agroassist/
├── README.md                           # Este archivo
├── agroassist-backend/                 # Backend Node.js
│   ├── src/
│   │   ├── application/use-cases/      # Casos de uso
│   │   ├── domain/entities/            # Entidades del dominio
│   │   ├── infrastructure/             # Servicios e infraestructura
│   │   └── interfaces/                 # Controladores y rutas
│   ├── package.json
│   └── API_DOCUMENTATION.md
├── agroassist-frontend/                # Frontend React Native
│   ├── src/
│   │   ├── components/                 # Componentes reutilizables
│   │   ├── navigation/                 # Navegación
│   │   ├── screens/                    # Pantallas
│   │   ├── services/                   # APIs y contextos
│   │   └── styles/                     # Estilos globales
│   ├── package.json
│   └── README.md
└── guia del proyecto/                  # Documentación y BD
    └── Script/                         # Scripts de base de datos
        ├── BaseDeDatosAgroassist.sql
        ├── MejorasBaseDatos.sql
        └── MigracionAlterTables.sql
```

## 🏆 Logros del Proyecto

✅ **Sistema completo funcional** - Backend + Frontend integrados
✅ **Información especializada** - Datos específicos para Colombia  
✅ **APIs científicas** - Integración con fuentes confiables
✅ **UX profesional** - Diseño intuitivo y atractivo
✅ **Código limpio** - Arquitectura escalable y mantenible
✅ **Documentación completa** - Guías técnicas y de usuario

---

**AgroAssist - Asistente agrícola inteligente para Colombia** 🇨🇴🌱

*Desarrollado con tecnologías modernas para ayudar a los agricultores colombianos*
- Se garantiza el derecho de los usuarios a actualizar o eliminar su información personal en cualquier momento.

## 🧑‍💻 Contribuciones

Este proyecto hace parte de un trabajo de grado para el programa de Ingeniería en Desarrollo de Software. Por ahora, no se aceptan contribuciones externas.

---

Desarrollado con ❤️ para apoyar a los pequeños agricultores colombianos.
