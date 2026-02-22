# syntax=docker/dockerfile:1.7

FROM maven:3.9.9-eclipse-temurin-21 AS deps
WORKDIR /workspace
COPY pom.xml ./pom.xml
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -DskipTests dependency:go-offline

FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY --from=deps /root/.m2 /root/.m2
COPY pom.xml ./pom.xml
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre-jammy AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system appgroup \
    && useradd --system --gid appgroup --create-home appuser
WORKDIR /app
COPY --from=builder /workspace/target/*.jar /app/app.jar
RUN chown -R appuser:appgroup /app
USER appuser
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
