# Plan de Operación — PintAuto Inventory

**Versión:** 1.0  
**Fecha:** 2026-06-03  
**Proyecto:** Sistema de Gestión de Inventario — PintAuto  
**Repositorio:** PintAuto_Inventoary  

---

## Tabla de Contenidos

1. [Descripción General del Sistema](#1-descripción-general-del-sistema)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Requisitos de Infraestructura](#3-requisitos-de-infraestructura)
4. [Configuración de Entornos](#4-configuración-de-entornos)
5. [Procedimiento de Despliegue](#5-procedimiento-de-despliegue)
6. [Gestión de Base de Datos](#6-gestión-de-base-de-datos)
7. [Seguridad y Acceso](#7-seguridad-y-acceso)
8. [Monitoreo y Mantenimiento](#8-monitoreo-y-mantenimiento)
9. [Gestión de Respaldos](#9-gestión-de-respaldos)
10. [Procedimientos ante Incidentes](#10-procedimientos-ante-incidentes)
11. [Roles y Responsabilidades](#11-roles-y-responsabilidades)
12. [Flujos de Operación del Negocio](#12-flujos-de-operación-del-negocio)

---

## 1. Descripción General del Sistema

PintAuto Inventory es una aplicación web de gestión de inventario orientada al negocio de PintAuto. Permite administrar materias primas, clientes, órdenes de trabajo y órdenes de compra, además de generar reportes en PDF.

### Módulos principales

| Módulo | Descripción |
|--------|-------------|
| Autenticación | Control de acceso mediante JWT para el ingreso del Administrador |
| Materia Prima | Gestión de stock, precios y alertas de inventario |
| Clientes | Registro y administración con validación de cédula ecuatoriana |
| Órdenes de Trabajo | Creación de órdenes vinculando cliente, materiales y responsable |
| Órdenes de Compra | Ciclo de compras con flujo de estados: PENDIENTE → APROBADA → RECIBIDA |
| Reportes | Generación de reportes PDF por rango de fechas o por material |

---

## 2. Arquitectura del Sistema

El sistema sigue una arquitectura cliente-servidor de dos capas separadas:

```
┌─────────────────────────────────────────────────────┐
│                   NAVEGADOR WEB                     │
│                                                     │
│   React 19 + Vite 6 + Tailwind CSS + Framer Motion │
│   Puerto: 5173 (dev) / Servidor estático (prod)    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/JSON  (Axios + JWT Bearer)
                       ▼
┌─────────────────────────────────────────────────────┐
│               BACKEND — Spring Boot 3.5.3           │
│                                                     │
│   REST API  │  Spring Security  │  JJWT  │ OpenPDF │
│   Puerto: 5000                                      │
└──────────────────────┬──────────────────────────────┘
                       │  JPA / Hibernate
                       ▼
┌─────────────────────────────────────────────────────┐
│               BASE DE DATOS — PostgreSQL            │
│                                                     │
│   Base: pintAutoSpring   Puerto: 5433               │
└─────────────────────────────────────────────────────┘
```

### Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React | 19.1.0 |
| Frontend | Vite | 6.3.5 |
| Frontend | Tailwind CSS | 3.4.17 |
| Frontend | React Router | 7.6.0 |
| Frontend | Axios | 1.9.0 |
| Backend | Spring Boot | 3.5.3 |
| Backend | Java | 17 |
| Backend | Spring Security + JJWT | 0.11.5 |
| Backend | OpenPDF | 1.3.30 |
| Base de datos | PostgreSQL | 14+ |
| ORM | Hibernate / JPA | (incluido en Spring Boot) |

---

## 3. Requisitos de Infraestructura

### Hardware mínimo (servidor de producción)

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 núcleos | 4 núcleos |
| RAM | 4 GB | 8 GB |
| Almacenamiento | 20 GB | 50 GB SSD |
| Red | 10 Mbps | 100 Mbps |

### Software requerido

| Software | Versión mínima | Notas |
|----------|---------------|-------|
| Java JDK | 17 | OpenJDK o Eclipse Temurin |
| Maven | 3.9+ | Para compilar el backend |
| Node.js | 18+ | Para compilar el frontend |
| npm | 9+ | Gestor de paquetes frontend |
| PostgreSQL | 14+ | Motor de base de datos |
| Navegador | Chrome 90+ / Firefox 90+ / Edge 90+ | Para uso del sistema |

### Puertos necesarios

| Puerto | Servicio | Dirección |
|--------|---------|-----------|
| 5000 | API REST (Spring Boot) | Backend |
| 5173 | Frontend dev server (Vite) | Desarrollo |
| 5433 | PostgreSQL | Base de datos |
| 80 / 443 | Servidor web (producción) | Nginx / Apache |

---

## 4. Configuración de Entornos

### 4.1 Entorno de Desarrollo

**Backend — `inventory-management/src/main/resources/application.properties`:**

```properties
server.port=5000

spring.datasource.url=jdbc:postgresql://localhost:5433/pintAutoSpring
spring.datasource.username=postgres
spring.datasource.password=admin

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=QwErTyUiOpAsDfGhJkLzXcVbNm123456
jwt.expiration=28800000

app.admin.email=admin@pintauto.com
app.admin.password=admin123
```

**Frontend — `client/.env` (crear este archivo en desarrollo):**

```env
VITE_API_URL=http://localhost:5000
```

### 4.2 Entorno de Producción

Para producción se deben cambiar los valores sensibles:

**Backend — Variables de entorno recomendadas (no hardcoded):**

```properties
server.port=5000

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=validate

jwt.secret=${JWT_SECRET}
jwt.expiration=28800000

app.admin.email=${ADMIN_EMAIL}
app.admin.password=${ADMIN_PASSWORD}
```

**Frontend — `client/.env.production`:**

```env
VITE_API_URL=https://api.pintauto.com
```

> **Importante:** Nunca incluir credenciales reales en el repositorio. Usar variables de entorno del sistema operativo o un gestor de secretos.

---

## 5. Procedimiento de Despliegue

### 5.1 Despliegue en Desarrollo

#### Backend

```bash
# 1. Ingresar a la carpeta del backend
cd inventory-management

# 2. Compilar y ejecutar
mvn spring-boot:run

# El servidor inicia en http://localhost:5000
```

#### Frontend

```bash
# 1. Ingresar a la carpeta del frontend
cd client

# 2. Instalar dependencias (primera vez)
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# El servidor inicia en http://localhost:5173
```

### 5.2 Despliegue en Producción

#### Backend (JAR ejecutable)

```bash
# 1. Compilar el proyecto (saltar tests con -DskipTests si es necesario)
cd inventory-management
mvn clean package

# 2. El artefacto generado estará en:
#    target/inventory-management-0.0.1-SNAPSHOT.jar

# 3. Ejecutar el JAR
java -jar target/inventory-management-0.0.1-SNAPSHOT.jar \
  --spring.datasource.url=jdbc:postgresql://HOST:5433/pintAutoSpring \
  --spring.datasource.username=USUARIO \
  --spring.datasource.password=CONTRASEÑA \
  --jwt.secret=SECRETO_SEGURO_64_CARACTERES
```

#### Frontend (build estático)

```bash
# 1. Generar el build de producción
cd client
npm run build

# 2. Los archivos estáticos se generan en client/dist/
# 3. Servir con Nginx apuntando al directorio dist/
```

#### Configuración Nginx (ejemplo)

```nginx
server {
    listen 80;
    server_name pintauto.com;

    # Servir frontend estático
    root /var/www/pintauto/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy inverso al backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5.3 Verificación Post-Despliegue

Después de desplegar, verificar:

- [ ] El backend responde en `GET /api/auth/verify` (sin token → 401 esperado)
- [ ] El frontend carga sin errores en el navegador
- [ ] El login con `admin@pintauto.com` / `admin123` funciona
- [ ] Se pueden listar materias primas y clientes
- [ ] La generación de reportes PDF funciona

---

## 6. Gestión de Base de Datos

### 6.1 Esquema de tablas

El esquema es gestionado automáticamente por Hibernate (`ddl-auto=update`). Las tablas principales son:

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Cuentas de usuario del sistema |
| `clientes` | Clientes de PintAuto con validación de cédula |
| `materia_prima` | Inventario de materias primas |
| `orden_trabajo` | Órdenes de servicio vinculadas a clientes |
| `orden_compra` | Órdenes de compra a proveedores |

### 6.2 Datos iniciales (Seeding)

Al iniciar la aplicación por primera vez, `DataInitializer` crea el usuario administrador por defecto:

| Campo | Valor |
|-------|-------|
| Email | admin@pintauto.com |
| Contraseña | admin123 |
| Rol | Administrador |

> **Acción recomendada:** Cambiar la contraseña del administrador después del primer inicio en producción.

### 6.3 Creación de la base de datos

```sql
-- Conectarse a PostgreSQL y crear la base de datos
CREATE DATABASE "pintAutoSpring";

-- Verificar la conexión
\c pintAutoSpring
```

### 6.4 Migraciones

Actualmente el esquema usa `ddl-auto=update`. Para producción se recomienda migrar a Flyway o Liquibase para un control versionado del esquema.

---

## 7. Seguridad y Acceso

### 7.1 Autenticación

- El sistema usa **JWT (JSON Web Tokens)** con expiración de **8 horas**.
- Los tokens se almacenan en `localStorage` del navegador.
- Cada petición al API incluye el header: `Authorization: Bearer <token>`.
- Al expirar el token (error 401), el sistema redirige automáticamente al login.

### 7.2 Endpoints públicos vs protegidos

| Tipo | Endpoints |
|------|-----------|
| Públicos | `POST /api/auth/login`, `GET /api/auth/verify` |
| Protegidos | Todos los demás (`/api/materia/**`, `/api/cliente/**`, `/api/orden/**`, `/api/reportes/**`) |

### 7.3 CORS

El backend permite solicitudes únicamente desde `http://localhost:5173` (desarrollo). En producción, actualizar la configuración CORS en `SecurityConfig.java` para apuntar al dominio real del frontend.

### 7.4 Recomendaciones de seguridad para producción

- [ ] Cambiar `jwt.secret` por una cadena aleatoria de al menos 64 caracteres.
- [ ] Cambiar la contraseña del administrador por defecto.
- [ ] Deshabilitar `spring.jpa.show-sql=true` en producción.
- [ ] Usar HTTPS (certificado SSL/TLS).
- [ ] Restringir el acceso al puerto 5433 de PostgreSQL solo al servidor backend.
- [ ] No exponer el puerto 5000 directamente; usar Nginx como proxy inverso.

---

## 8. Monitoreo y Mantenimiento

### 8.1 Actuator (Spring Boot)

El backend incluye **Spring Boot Actuator** para monitoreo. Endpoints disponibles:

| Endpoint | Descripción |
|----------|-------------|
| `GET /actuator/health` | Estado general de la aplicación |
| `GET /actuator/info` | Información de la aplicación |
| `GET /actuator/metrics` | Métricas de rendimiento |

> En producción, proteger o restringir el acceso a los endpoints de Actuator.

### 8.2 Logs

Los logs de Spring Boot se muestran en consola por defecto. Para producción, redirigir a archivo:

```properties
# En application.properties (producción)
logging.file.name=/var/log/pintauto/app.log
logging.level.root=WARN
logging.level.com.pintaauto=INFO
```

### 8.3 Alertas operativas

| Condición | Acción recomendada |
|-----------|-------------------|
| Stock de materia prima < `cantidadMinima` | Generar orden de compra |
| Error 500 frecuente en el API | Revisar logs del backend |
| Tiempo de respuesta > 3 segundos | Verificar conexión a base de datos |
| Falla de login masiva | Posible intento de acceso no autorizado |

### 8.4 Mantenimiento rutinario

| Frecuencia | Tarea |
|-----------|-------|
| Diario | Verificar estado de la aplicación y logs de errores |
| Semanal | Revisar materias primas con stock bajo |
| Mensual | Revisar y archivar órdenes de trabajo completadas |
| Mensual | Generar reportes de consumo de materiales |
| Trimestral | Revisar usuarios activos e inactivos |

---

## 9. Gestión de Respaldos

### 9.1 Respaldo de base de datos

```bash
# Respaldo completo de la base de datos
pg_dump -U postgres -h localhost -p 5433 pintAutoSpring > backup_$(date +%Y%m%d).sql

# Restaurar respaldo
psql -U postgres -h localhost -p 5433 pintAutoSpring < backup_20260603.sql
```

### 9.2 Frecuencia de respaldos recomendada

| Tipo | Frecuencia | Retención |
|------|-----------|-----------|
| Respaldo completo | Diario | 30 días |
| Respaldo semanal | Semanal | 3 meses |
| Respaldo mensual | Mensual | 1 año |

### 9.3 Respaldo de archivos de configuración

Mantener respaldo seguro de:
- `application.properties` (sin credenciales en el repositorio)
- Variables de entorno del servidor
- Configuración Nginx

---

## 10. Procedimientos ante Incidentes

### 10.1 Clasificación de incidentes

| Nivel | Descripción | Tiempo de respuesta |
|-------|-------------|-------------------|
| Crítico | Sistema completamente inaccesible | Inmediato |
| Alto | Módulo principal no funciona (ej. login caído) | < 1 hora |
| Medio | Funcionalidad secundaria con error | < 4 horas |
| Bajo | Error menor o cosmético | < 24 horas |

### 10.2 Procedimiento general ante caída del sistema

1. **Identificar** el componente afectado (frontend / backend / base de datos).
2. **Revisar logs** del backend en consola o archivo de log.
3. **Verificar conectividad** a la base de datos PostgreSQL.
4. **Verificar proceso** del backend: `ps aux | grep java` (Linux) o Administrador de tareas (Windows).
5. **Reiniciar** el servicio afectado si corresponde.
6. **Verificar** que el sistema volvió a funcionar correctamente.
7. **Documentar** el incidente con causa raíz y solución aplicada.

### 10.3 Problemas comunes y soluciones

| Problema | Causa probable | Solución |
|---------|---------------|---------|
| Error 401 en todas las peticiones | Token JWT expirado | Cerrar sesión y volver a iniciar |
| Error 500 en el backend | Error interno o DB caída | Revisar logs y conexión a DB |
| Frontend no carga | `VITE_API_URL` incorrecto | Verificar variable de entorno |
| Error de CORS | Dominio frontend no permitido | Actualizar `SecurityConfig.java` |
| Login falla con credenciales correctas | BD no inicializada | Verificar que `DataInitializer` corrió |
| PDF no se genera | Falta datos en el rango consultado | Verificar que existan órdenes de trabajo |

---

## 11. Roles y Responsabilidades

### 11.1 Roles del sistema

| Rol | Capacidades |
|-----|------------|
| Administrador | Acceso completo a todos los módulos y configuraciones |
| Usuario | Gestión de órdenes, clientes y consulta de inventario |

### 11.2 Responsabilidades operativas

| Responsable | Tareas |
|------------|-------|
| Administrador del sistema | Gestión de usuarios, configuración, respaldos |
| Operador de inventario | Alta/baja/modificación de materias primas |
| Operador de ventas | Registro de clientes y órdenes de trabajo |
| Responsable de compras | Gestión del ciclo de órdenes de compra |

---

## 12. Flujos de Operación del Negocio

### 12.1 Flujo de Orden de Trabajo

```
1. Registrar cliente (si no existe)
        ↓
2. Crear Orden de Trabajo
   - Seleccionar cliente
   - Ingresar datos del vehículo
   - Seleccionar materias primas y cantidades
        ↓
3. Sistema descuenta automáticamente el stock
        ↓
4. Si stock < cantidadMínima → crear Orden de Compra
        ↓
5. Finalizar la orden con fecha y hora de cierre
```

### 12.2 Flujo de Orden de Compra

```
PENDIENTE
    ↓ (Aprobación del responsable)
APROBADA
    ↓ (Recepción física de mercancía)
RECIBIDA ──→ Stock de materia prima se actualiza automáticamente
    
En cualquier punto:
    ↓ (Cancelación justificada)
CANCELADA
```

### 12.3 Flujo de Generación de Reportes

```
Tipo 1 — Por rango de fechas:
  Seleccionar fecha inicio y fin
        ↓
  Sistema consulta todas las órdenes de trabajo en ese período
        ↓
  Agrupa el consumo por materia prima
        ↓
  Genera PDF descargable

Tipo 2 — Por material:
  Seleccionar una o varias materias primas
        ↓
  Sistema consulta todas las órdenes que usaron ese material
        ↓
  Muestra consumo histórico y totales
        ↓
  Genera PDF descargable
```

---

## Apéndice A — Comandos de Referencia Rápida

```bash
# Iniciar backend (desarrollo)
cd inventory-management && mvn spring-boot:run

# Iniciar frontend (desarrollo)
cd client && npm run dev

# Ejecutar pruebas frontend
cd client && npm test

# Compilar backend para producción
cd inventory-management && mvn clean package -DskipTests

# Compilar frontend para producción
cd client && npm run build

# Respaldo de base de datos
pg_dump -U postgres -p 5433 pintAutoSpring > backup.sql

# Ver logs del backend (si se redirigen a archivo)
tail -f /var/log/pintauto/app.log
```

---

## Apéndice B — Glosario

| Término | Definición |
|---------|-----------|
| JWT | JSON Web Token. Mecanismo de autenticación sin estado. |
| JPA | Java Persistence API. ORM para mapear entidades Java a tablas SQL. |
| Materia Prima | Material o insumo utilizado en los trabajos de PintAuto. |
| Orden de Trabajo | Registro de un servicio realizado a un vehículo de un cliente. |
| Orden de Compra | Solicitud formal de reabastecimiento de materia prima a un proveedor. |
| Cédula Ecuatoriana | Documento de identidad de 10 dígitos con algoritmo de validación propio. |
| Vite | Herramienta de build rápida para proyectos frontend modernos. |
| Spring Boot | Framework de Java para construcción de aplicaciones empresariales. |
| ddl-auto | Propiedad de Hibernate que controla la gestión del esquema de base de datos. |
| CORS | Cross-Origin Resource Sharing. Política de seguridad del navegador. |

---

*Documento generado para el proyecto PintAuto Inventory — Construcción y Evolución del Software, 8vo semestre.*
