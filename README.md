# Camporee 2026 - Sistema de Control Vehicular

## 1. Descripción general

Este proyecto es un prototipo web de gestión de pases vehiculares para un camporee. Su objetivo es permitir que asistentes, comisiones y staff generen un pase QR para acceder al evento o a zonas de circulación específica; además, ofrece un módulo de validación en puerta para escanear QR y autorizar el ingreso.

El sistema está pensado para funcionar como una aplicación frontend estática, con almacenamiento local en navegador mediante `localStorage`, de forma que pueda ejecutarse sin necesidad de backend ni base de datos durante la fase de prototipo o demostración.

El proyecto está estructurado en tres accesos principales:

- Registro público: permite crear pases para iglesia, comisión o staff.
- Módulo de validación: simula una puerta de acceso con escáner QR.
- Panel administrativo: permite cambiar contraseña, ver registros, editar, activar/desactivar y eliminar elementos.

---

## 2. Objetivos del proyecto

### 2.1 Objetivo funcional

- Registrar vehículos asociados a distintas categorías.
- Controlar duplicidad de placas.
- Generar un QR por registro.
- Validar pases en puerta.
- Mantener un panel administrativo para gestionar accesos.
- Enviar al personal de seguridad un flujo simple y rápido para verificar entradas.

### 2.2 Objetivo de UX

- Interfaz amigable y móvil-first.
- Flujos guiados por pasos.
- Diseño visual campestre y evento-driven con colores institucionales.
- Evitar errores comunes: placas duplicadas, cupos agotados, pasos inválidos.

### 2.3 Objetivo de demostración

- Presentar una solución realista para eventos con flujo de administración y validación.
- Hacer visible cómo opera un sistema de control vehicular con lógica de negocio básica.

---

## 3. Alcance actual del proyecto

Este proyecto se encuentra en una etapa de prototipo funcional frontend. Esto significa que:

- El manejo de datos se hace en el navegador.
- Los registros persisten en localStorage.
- No hay autenticación real basada en servidor.
- No hay base de datos persistente multiusuario.
- No hay sincronización entre dispositivos distintos.

Es una muy buena base para demostrar lógica, pantallas y flujos, pero no reemplaza un sistema productivo con backend y almacenamiento seguro.

---

## 4. Arquitectura del proyecto

El proyecto es un sitio web estático compuesto por:

- HTML para cada vista
- CSS para estilos y comportamiento visual
- JavaScript para lógica de negocio y localStorage
- Bibliotecas externas por CDN

### 4.1 Archivos principales

- `index.html`: página principal del registro vehicular.
- `validar.html`: vista para validación en puerta con lector QR.
- `admin.html`: panel de administración.
- `assets/css/styles.css`: estilos visuales del proyecto.
- `assets/js/app.js`: lógica del flujo de registro, validación de pasos y QR.
- `assets/js/auth.js`: lógica de contraseña, sesión y rutas protegidas.
- `assets/js/admin.js`: gestión del panel administrativo.

---

## 5. Flujo principal de negocio

### 5.1 Registro desde la home

La home presenta tres categorías de registro:

- Iglesia
- Comisión
- Staff

Cada categoría tiene un flujo distinto.

#### 5.1.1 Registro de Iglesia

Reglas:

- 1 vehículo por iglesia.
- Debe elegirse una zona.
- Luego una iglesia específica.
- Después se completan nombre, apellido, teléfono y placa.
- Se bloquea la placa si ya existe en otra entrada activa.

#### 5.1.2 Registro de Comisión

Reglas:

- Debe seleccionar una comisión.
- Se valida disponibilidad del cupo según la cuota por comisión.
- Debe elegir miembro y placa.
- La placa se compara contra los registros activos para evitar duplicados.

#### 5.1.3 Registro de Staff

Reglas:

- Se pide nombre, apellido, teléfono, placa y cargo.
- No hay cupo por zona, pero sí validación por duplicado de placa.

### 5.2 Generación del pase

Cuando el formulario finaliza correctamente:

- Se crea un registro en localStorage.
- Se genera un QR que contiene un formato tipo:
  `camporee|<id>`
- El QR puede descargarse como imagen.
- El usuario puede iniciar un nuevo registro.

### 5.3 Validación del pase en puerta

La vista `validar.html` tiene un escáner QR.

Cuando se escanea un código:

- Se revisa si el formato es válido.
- Se obtiene el ID asociado.
- Se busca en localStorage.
- Si no existe, se rechaza.
- Si ya fue usado, se rechaza.
- Si es válido y no ha sido usado, se marca como usado y se registra la fecha/hora.

---

## 6. Lógica de validación por pasos

El flujo de registro no es un formulario plano; en realidad es un wizard paso a paso.

### 6.1 Estado por categoría

El estado de la interfaz se gestiona con variables como:

- `currentCategory`
- `currentStep`
- `stepData`

Estas variables controlan:

- qué pantallas renderizar
- qué campos están activos
- si el usuario puede avanzar
- si se muestra el botón final “Generar Pase QR”

### 6.2 Reglas del botón de acción

El botón principal cambia su comportamiento según el paso actual:

- En pasos intermedios: `Siguiente`
- En el último paso: `Generar Pase QR`
- Se deshabilita si el paso actual no es válido

Esto se logra con funciones como:

- `isFinalStep()`
- `currentStepIsValid()`
- `updateActionButtons()`

### 6.3 Validaciones implementadas

- Zona seleccionada
- Iglesia seleccionada
- Comisión seleccionada
- Nombre, teléfono, apellido, placa completados
- Placa sin duplicados
- Cupos por comisión o iglesia

---

## 7. Modelo de datos y persistencia

La aplicación guarda registros usando `localStorage`.

### 7.1 Estructura típica de un registro

Cada registro puede tener propiedades como:

- `id`
- `category`
- `nombre`
- `apellido`
- `telefono`
- `placa`
- `churchId`
- `churchName`
- `comId`
- `comName`
- `cargo`
- `createdAt`
- `used`
- `usedAt`
- `disabled`

### 7.2 Persistencia

Las funciones principales son:

- `loadRegistrations()`
- `saveRegistrations(arr)`
- `addRegistration(reg)`

Esto permite que al recargar el navegador los datos sigan disponibles en el mismo navegador.

### 7.3 Limitaciones de localStorage

La persistencia local tiene varias limitaciones:

- Solo existe en el navegador del usuario.
- No es compartida entre dispositivos.
- No es segura para almacenamiento sensible.
- No escala bien para múltiples usuarios simultáneos.
- No tiene autenticación real ni control de concurrencia.

---

## 8. Autenticación y seguridad actual

El proyecto incluye un acceso protegido para:

- Modo Puerta
- Ver Registros
- Panel administrativo

### 8.1 Contraseña por defecto

La contraseña por defecto es:

`Camporee*2026`

Se almacena en `localStorage` con clave:

- `camporee-admin-password`

### 8.2 Sesión de administrador

La sesión se guarda con:

- `camporee-admin-auth`

Cuando el usuario ingresa la contraseña correcta:

- se establece la sesión en true
- se permite abrir la ventana administrativa o la validación

### 8.3 Módulos protegidos

- `index.html`: los botones de acceso admin se abren con login modal.
- `validar.html`: la cámara queda oculta hasta autenticar.
- `admin.html`: panel seguro y protegido por sesión.

### 8.4 Nivel de seguridad actual

Esto es solo protección de UX/prototipo. No es seguridad real para producción porque:

- la contraseña está en localStorage
- no hay hash o cifrado
- no hay validación de sesión en servidor
- puede ser manipulado desde el navegador del cliente

---

## 9. Panel administrativo

El panel administrativo está en `admin.html` y funciona como una consola de control del sistema.

### 9.1 Funcionalidades

- cambiar contraseña
- ver resumen estadístico
- ver todos los registros
- editar nombre, apellido, teléfono, placa y cargo
- activar/desactivar registros
- eliminar registros
- abrir la pantalla de validación en otra pestaña

### 9.2 Cambiar contraseña

El formulario valida:

- que la contraseña actual coincida
- que la nueva contraseña no esté vacía
- que tenga longitud mínima de 4 caracteres
- que al confirmar coincida exactamente

### 9.3 Gestión de registros

En la tabla de registros, cada fila incluye acciones para:

- `Editar`
- `Eliminar`
- `Desactivar / Activar`

Esto permite simular un panel de control de acceso con administración manual del inventario.

---

## 10. Modo puerta y validación QR

La vista `validar.html` representa el módulo dedicado a la seguridad del evento.

### 10.1 Componentes

- un contenedor para la cámara
- un botón para iniciar escaneo
- un botón para detener escaneo
- un panel para mostrar resultados de validación

### 10.2 Librería usada

Se usa `html5-qrcode` para acceder a la cámara del navegador y escanear códigos QR.

### 10.3 Comportamiento

Cuando escanea:

- valida el formato `camporee|id`
- busca el registro asociado
- comprueba si está disponible
- marca como usado con timestamp
- muestra mensaje de éxito o rechazo

### 10.4 Casos de rechazo

- QR inválido
- Registro no encontrado
- Pase ya usado
- Registro desactivado

---

## 11. Generación de QR

La librería `QRCode` se usa para generar el código QR asociado a cada pase.

### 11.1 Formato del QR

Se genera con:

`camporee|<id>`

Esto permite que el módulo de validación pueda reconocer rápidamente si el pase pertenece al sistema.

### 11.2 Uso

- Se crea después del registro exitoso.
- Se dibuja en la pantalla final.
- Se puede descargar como imagen PNG.

---

## 12. Tecnologías utilizadas

### 12.1 HTML5

#### Ventajas

- Muy sencillo de usar.
- Compatible universalmente con navegadores.
- Ideal para prototipos rápidos.
- No requiere instalación ni compilación.

#### Desventajas

- No es un framework de UI.
- No maneja lógica compleja de estado con la misma estructura que React/Vue.
- Puede volverse difícil de mantener cuando la aplicación crece.

### 12.2 CSS

Se usa CSS nativo junto con Tailwind CSS via CDN.

#### Ventajas

- Facilidad de diseño rápido.
- Estructura visual moderna.
- Buen soporte responsive.
- Acelera el desarrollo tanto en móvil como en escritorio.

#### Desventajas

- El comportamiento puede volverse complejo sin una estructura clara.
- Si se usa mucho inline, puede dificultar mantenimiento.
- Dependencia de CDN para ciertos estilos si se quisiera trabajar sin conexión.

### 12.3 JavaScript

Es el motor de la lógica del sistema.

#### Ventajas

- Muy flexible.
- Trabaja directamente en navegador.
- Permite integrar librerías sin build tooling.
- Excelente para prototipos.

#### Desventajas

- Más propenso a errores si no se organiza bien.
- Mantenimiento más difícil en proyectos grandes.
- Debe manejar validaciones y estados manualmente.

### 12.4 Tailwind CSS

#### Ventajas

- Rápido para prototipos UI.
- Classes utilitarias ideales para diseño ágil.
- Menor necesidad de escribir CSS personalizado.

#### Desventajas

- Estilos dinámicos no siempre se mantienen tan legibles.
- Requiere CDN o proceso de build para entornos productivos.
- Menor control fino si no se organiza bien.

### 12.5 QRCode.js

Usado para crear QR desde el navegador.

#### Ventajas

- Muy fácil de integrar.
- Permite generar QR dinámicamente.
- Ideal para prototipos.

#### Desventajas

- No ofrece control avanzado de escaneo o seguridad.
- No sustituye un sistema de validación robusto real.

### 12.6 html5-qrcode

Usado para leer códigos QR desde la cámara del navegador.

#### Ventajas

- Muy útil para pruebas rápidas.
- Se integra sin backend.
- Permite simular la lógica de validación.

#### Desventajas

- Depende de permisos del navegador para cámara.
- El rendimiento puede variar según dispositivo.
- No es una solución de seguridad real ni producción.

### 12.7 localStorage

#### Ventajas

- Muy rápido de implementar.
- Funciona sin servidor.
- Ideal para prototipos o demos.

#### Desventajas

- No es seguro.
- No es compartido entre equipos.
- Tiene limitaciones de almacenamiento.
- No es adecuado para flujo real de producción.

---

## 13. Flujo técnico del proyecto

### 13.1 Inicio de la aplicación

Al abrir la app:

- se cargan estilos
- se ejecuta la lógica JS
- se construyen los formularios dinámicos
- se prepara la interacción con los botones

### 13.2 Elección de categoría

Cuando el usuario hace click en una categoría:

- se asigna `currentCategory`
- se resetea `currentStep`
- se oculta la vista de landing
- se renderiza el primer paso del wizard

### 13.3 Avance del proceso

Cada vez que se pulsa `Siguiente`:

- se valida el paso actual
- si es válido, se avanza al siguiente paso
- si no, se bloquea la acción con mensaje de error o deshabilitando el botón

### 13.4 Finalización del registro

Cuando se valida el último paso:

- se crea el objeto del registro
- se agrega a localStorage
- se genera QR
- se muestra la pantalla de confirmación

### 13.5 Escaneo en puerta

En `validar.html`:

- se activa la cámara
- se interpreta el QR
- se busca el registro en localStorage
- se marca como usado en la propia base local

---

## 14. Ejecución del proyecto

### 14.1 Requisitos mínimos

- Navegador moderno (Chrome, Edge, Firefox)
- Python 3 instalado
- Acceso a la cámara para la validación QR
- Conexión a internet si se usan recursos CDN

### 14.2 Opción recomendada: servidor local con Python

Desde la carpeta del proyecto:

```bash
cd c:\Users\soporte2\Desktop\camporee-web
python -m http.server 8000
```

Luego abre:

```text
http://localhost:8000
```

### 14.3 Ejecución desde la red local

Si deseas que se vea desde otra computadora en tu red local:

```bash
python -m http.server 8000 --bind 0.0.0.0
```

Y luego accede con la IP del equipo:

```text
http://<IP-LOCAL>:8000
```

### 14.4 Uso recomendado

- Abrir la pantalla principal para crear registros.
- Abrir la vista de validación en otra pestaña o dispositivo.
- Ingresar la contraseña por defecto.
- Escanear el QR generado.

---

## 15. Rutas principales de la app

- `/` → vista de registro
- `/index.html` → registro principal
- `/validar.html` → módulo de validación
- `/admin.html` → panel administrativo

---

## 16. Contraseña por defecto

El sistema usa por defecto esta contraseña:

```text
Camporee*2026
```

Se recomienda cambiarla desde el panel administrativo en cuanto se use en una demostración real.

---

## 17. Ventajas del proyecto actual

- Rápido de desplegar
- Muy fácil de demostrar
- Compatible con cualquier navegador moderno
- No requiere backend ni base de datos
- Ideal para mockups, presentaciones y validación funcional
- Atractivo para demos de evento o feria

---

## 18. Desventajas o limitaciones

- Persistencia solo local
- No hay seguridad real de backend
- No hay múltiples usuarios concurrentes
- La cámara depende del navegador y del dispositivo
- El sistema es sensible a cambios manuales en localStorage
- No hay auditoría real ni control centralizado
- No hay recuperación de datos ni respaldo automático

---

## 19. Estado recomendado para producción

Este proyecto está listo como prototipo funcional, pero para pasar a producción se recomienda:

- Backend con Node.js, Express o Laravel
- Base de datos relacional o NoSQL
- Autenticación con JWT o sesión segura
- API REST para registros, autenticación y validación
- Cifrado de contraseñas
- Base de datos centralizada
- Panel administrador con permisos por rol
- Persistencia de QR y auditoría de accesos

---

## 20. Recomendaciones futuras

- Sistema de login real con usuarios administradores y roles.
- Base de datos para registros persistentes.
- API para escaneo de QR desde hardware de puerta.
- Notificaciones con WebSockets.
- Reportes por fecha, zona, iglesia, comisión y staff.
- Generación y bloqueo de QR temporal por evento.
- Soporte para múltiples cámaras y dispositivos.
- Registro de auditoría de intentos fallidos de acceso.

---

## 21. Resumen ejecutivo

Este proyecto es un prototipo de gestión vehicular para Camporee 2026. Está pensado para automatizar la emisión y validación de pases QR para distintos tipos de asistentes. Tiene una UX orientada a evento y una lógica funcional en frontend con persistencia local.

Su ventaja principal es que puede ejecutarse rápidamente, demostrarse visualmente y validarse en entorno local sin necesidad de infraestructura compleja. Su limitación principal es que no tiene backend ni seguridad fuerte, por lo que debe considerarse como una solución de prueba o prototipo y no como un sistema productivo final.

---

## 22. Conclusión

Este proyecto combina diseño, lógica de negocio, gestión de datos y validación QR para crear una experiencia completa de administración y control de acceso. Ha sido pensado para funcionar como una demostración realista de un sistema de control vehicular para un evento masivo, con flujo de registro y validación en puerta.

Si se desea escalar más allá del prototipo, el siguiente paso natural es implementar una base de datos real y un backend seguro para manejar usuarios, registros, permisos y autenticación profesional.

---

## 23. Comandos útiles

### Ejecutar localmente

```bash
cd c:\Users\soporte2\Desktop\camporee-web
python -m http.server 8000
```

### Abrir en navegador

```text
http://localhost:8000
```

### Ejecutar en red local

```bash
python -m http.server 8000 --bind 0.0.0.0
```

### Contraseña por defecto

```text
Camporee*2026
```

---

## 24. Contacto y notas finales

Este README está pensado para servir como documentación técnica y operativa del proyecto. Se recomienda revisarlo y actualizarlo conforme se agreguen nuevas funciones, nuevos módulos o se migre a una arquitectura con backend real.
