FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY agent-core agent-core
RUN ./gradlew :agent-core:build -Dquarkus.package.type=uber-jar -x test

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/agent-core/build/*-runner.jar app.jar
EXPOSE 8083
CMD ["java", "-jar", "app.jar"]

