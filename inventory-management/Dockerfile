# Stage 1: Build (Imagen con Maven y Java 17 para compilar)
FROM maven:3.8.5-openjdk-17 AS builder

WORKDIR /app

# Copiamos el archivo de configuración de dependencias
COPY pom.xml .

# Descargamos las dependencias en caché para acelerar futuros despliegues
RUN mvn dependency:go-offline -B

# Copiamos el código fuente de la aplicación
COPY src ./src

# Compilamos omitiendo por completo la carpeta de pruebas (src/test)
RUN mvn clean package -Dmaven.test.skip=true -B

# Stage 2: Runtime (Imagen ligera solo con el JRE para ejecutar)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Crear un usuario de sistema seguro para no ejecutar Spring como root
RUN addgroup -S spring && adduser -S spring -G spring

# Copiamos el .jar compilado desde la etapa anterior
COPY --from=builder /app/target/*.jar app.jar

# Asignamos los permisos del archivo al usuario seguro
RUN chown spring:spring app.jar

USER spring

# Exponemos el puerto 5000 que espera Render
EXPOSE 5000

# CORRECCIÓN CLAVE: Formato Shell para que inyecte correctamente las variables de $JAVA_OPTS
ENTRYPOINT java $JAVA_OPTS -jar app.jar