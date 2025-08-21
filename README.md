
# AgroAssist - Backend

Este repositorio contiene el código fuente del backend de **AgroAssist**, una aplicación móvil desarrollada para brindar asistencia a pequeños agricultores colombianos mediante el uso de inteligencia artificial (IA), APIs agroclimáticas y un sistema de gestión de información agrícola.

## 🛠 Tecnologías utilizadas

- **Node.js** - Entorno de ejecución JavaScript.
- **Express.js** - Framework web para la creación de la API REST.
- **MySQL** - Motor de base de datos relacional.
- **JWT (JSON Web Tokens)** - Para autenticación de usuarios.

- **RESTful APIs** - Consumo de servicios externos (clima, precios, plagas).

## 📁 Estructura del proyecto (prevista)

```
agroassist-backend/
├── controllers/        
├── routes/            
├── models/             
├── middlewares/        
├── services/           
├── config/             
├── .env                
├── .gitignore          
├── README.md           
└── index.js            
```

## 🚀 Funcionalidades del backend

- Registro e inicio de sesión de usuarios con autenticación por JWT.
- Gestión de roles: usuario estándar y administrador.
- Endpoints REST para:
  - Consulta de clima actual y pronóstico (OpenWeatherMap, Weatherstack).
  - Consulta de precios del mercado (Agrodata, Agromática).
  - Información sobre plagas y su control (Agri-Tech).

- Preparado para respuestas por texto y voz (integración con frontend por API).

## 🔐 Contexto legal y normativo

- **Ley 1581 de 2012** – Protección de Datos Personales en Colombia. [Ver norma](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981)
- **Ley 1341 de 2009** – Impulso a las TIC para reducir la brecha digital. [Ver norma](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=36913)
- **Resolución 2564 de 2016 (MinTIC)** – Accesibilidad digital e inclusión en el desarrollo de software. [Ver resolución](https://normograma.mintic.gov.co/mintic/compilacion/docs/resolucion_mintic_2564_2016.htm)

## ⚠️ Consideraciones

- El tratamiento de datos se realiza con consentimiento del usuario y siguiendo los principios de legalidad, finalidad y transparencia.
- Se garantiza el derecho de los usuarios a actualizar o eliminar su información personal en cualquier momento.

## 🧑‍💻 Contribuciones

Este proyecto hace parte de un trabajo de grado para el programa de Ingeniería en Desarrollo de Software. Por ahora, no se aceptan contribuciones externas.

---

Desarrollado con ❤️ para apoyar a los pequeños agricultores colombianos.
