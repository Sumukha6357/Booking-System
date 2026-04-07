# syntax=docker/dockerfile:1.7

FROM maven:3.9-eclipse-temurin-17 AS deps
WORKDIR /workspace
COPY pom.xml ./pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -DskipTests dependency:go-offline

FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /workspace
COPY --from=deps /root/.m2 /root/.m2
COPY pom.xml ./pom.xml
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine AS runtime
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /workspace/target/*.jar /app/app.jar
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
