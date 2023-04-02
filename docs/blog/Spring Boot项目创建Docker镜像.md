# Spring Boot项目创建Docker镜像
### 项目打包


```shell
./mvnw package
```


```shell
./gradlew build
```

### 项目可执行测试


```shell
java -jar build/libs/${你的jar}.jar
```

### 自定义构建文件名称


```groovy
bootJar {
    archiveFileName = "${archiveBaseName.get()}.${archiveExtension.get()}"
}
```

### Dockerfile定义

Dockerfile 一般放在项目根目录，因此就以项目根目录作为docker镜像的工作空间。


```docker
FROM openjdk:8-jdk-alpine
EXPOSE 8080

RUN adduser -S admin -G root

ARG APPNAME
ENV APPNAME=${APPNAME}

# 使用镜像加速，参考http://mirrors.ustc.edu.cn/help/alpine.html
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
    apk add --update curl && \
    apk add gcompat && \
    rm -rf /var/cache/apk/*

# issue https://github.com/grpc/grpc-java/issues/8751 & https://github.com/netty/netty/issues/11701
ENV LD_PRELOAD=/lib/libgcompat.so.0

USER admin:root
COPY starter/build/libs/${APPNAME}.jar /home/admin/${APPNAME}.jar

WORKDIR /home/admin
ENTRYPOINT java -jar /home/admin/${APPNAME}.jar
```

### Dockerfile构建镜像


```plain text
docker build --build-arg APPNAME=demo -t wnow20/demo .
```

### 日志挂载

可以在项目中的日志配置中设置日志输出路径，本文用的是backlog，backlog配置如下：


```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <property name="LOGS" value="${user.home}/logs" />

    <appender name="Console"
              class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>
                %black(%d{ISO8601}) %highlight(%-5level) [%blue(%t)] %yellow(%C{1.}): %msg%n%throwable
            </Pattern>
        </layout>
    </appender>

    <appender name="RollingFile"
              class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOGS}/spring-boot-logger.log</file>
        <encoder
                class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
            <Pattern>%d %p %C{1.} [%t] %m%n</Pattern>
        </encoder>

        <rollingPolicy
                class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- rollover daily and when the file reaches 10 MegaBytes -->
            <fileNamePattern>${LOGS}/archived/spring-boot-logger-%d{yyyy-MM-dd}.%i.log
            </fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy
                    class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>10MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
    </appender>

    <!-- LOG everything at INFO level -->
    <root level="info">
        <appender-ref ref="RollingFile" />
        <appender-ref ref="Console" />
    </root>

    <!-- LOG "com.baeldung*" at TRACE level -->
    <logger name="com.example" level="trace" additivity="false">
        <appender-ref ref="RollingFile" />
        <appender-ref ref="Console" />
    </logger>

</configuration>
```

另外docker容器还可以挂载盘符，例子如下：


```yaml
version: '3.9'

services:
  demo:
    image: wnow20/demo:v1
    volumes:
      - /Users/ge/docker-files/demo/logs:/home/admin/logs
    environment:
      - SPRING_PROFILES_ACTIVE=production
    ports:
      - 8080:8080
      - 8082:8082
    healthcheck:
      test: "curl --fail --silent http://127.0.0.1:8082/actuator/health | grep UP || exit 1"
      interval: 1s
      timeout: 5s
      retries: 3
      start_period: 5s
```

docker-compose.yml中，我们给服务增加健康检查，当且仅当服务可用时才对外提供服务。

部署


```plain text
docker stack deploy -c docker-compose.yml demo
```

源码链接：[https://github.com/wnow20/spring-boot-with-docker](https://github.com/wnow20/spring-boot-with-docker)

<br/>

