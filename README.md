Sistema Web de Registro Vehicular - Camporee

Este es un prototipo "frontend-only" para gestión y emisión de pases vehiculares con QR dinámicos.

Características:
- Registro por Iglesia (1 vehículo por iglesia).
- Registro por Comisión (1 pase por cada 5 miembros).
- Registro de Staff.
- Control anti-duplicados por PLACA.
- Generación de QR y descarga como imagen.
- Modo Puerta: escáner QR que marca pases como usados.

Archivos:
- index.html — Interfaz de registro (mobile-first).
- validar.html — Modo puerta con escáner de QR.
- assets/js/app.js — Lógica del prototipo (localStorage).
- assets/css/styles.css — Estilos adicionales.

Cómo probar:
1. Abrir `index.html` desde el Explorador (doble clic) o un servidor local.
2. Realizar registros de prueba y descargar el QR.
3. Abrir `validar.html` en un dispositivo con cámara para escanear y validar el pase.

Notas:
- Esta entrega es un prototipo sin backend; la persistencia se realiza en `localStorage`.
- Para producción se recomienda implementar un backend (Node/Express + PostgreSQL/SQLite) y endpoints para gestión segura de cupos y registro.
