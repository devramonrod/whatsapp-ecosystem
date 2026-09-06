FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY whatsapp-gateway whatsapp-gateway
RUN ./gradlew :whatsapp-gateway:build -Dquarkus.package.type=uber-jar -x test

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/whatsapp-gateway/build/*-runner.jar app.jar
EXPOSE 8081
CMD ["java", "-jar", "app.jar"]

