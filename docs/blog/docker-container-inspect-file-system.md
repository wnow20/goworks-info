# 如何查看Docker容器的文件系统

在构建镜像并试运行镜像时，常常由于启动报错，或者需要查看启动日志，甚至要确认文件系统结构需要查看镜像的文件系统，因此以下教程我们将讲解如何查看镜像或者容器的文件系统。

## 查看运行失败的容器的文件系统
```shell
# 查看docker所有容器信息
$ docker ps -a

# 以下是命令输出的示例
CONTAINER ID   IMAGE              COMMAND                  CREATED          STATUS                      PORTS     NAMES
d71e6785bbc5   aikit-web:latest   "docker-entrypoint.s…"   10 minutes ago   Exited (1) 10 minutes ago             jovial_booth
```

```shell
# 通过containerId构建测试镜像
docker commit d71e6785bbc5 debug/aikit-web
```

接下来就是登录测试镜像的控制台
```shell
docker run -it --rm --entrypoint sh debug/aikit-web
```

之后我们可以通过 `ls` 命令查看文件系统

```shell
$ ls -l

total 580
-rw-r--r-- 1 root root   1199 Apr  4 14:46 Dockerfile
-rw-r--r-- 1 root root   1197 Apr  3 20:48 README.md
drwxr-xr-x 3 root root   4096 Apr  4 14:32 app
-rwxr-xr-x 1 root root     31 Apr  4 13:13 bootstrap
drwxr-xr-x 1 root root   4096 Apr  4 14:32 build
drwxr-xr-x 1 root root  28672 Apr  4 14:32 node_modules
-rw-r--r-- 1 root root 503421 Apr  4 14:11 package-lock.json
-rw-r--r-- 1 root root   1072 Apr  4 06:33 package.json
drwxr-xr-x 1 root root   4096 Apr  4 14:32 public
-rw-r--r-- 1 root root    369 Apr  3 20:48 remix.config.js
-rw-r--r-- 1 root root     83 Apr  3 20:48 remix.env.d.ts
-rw-r--r-- 1 root root   3889 Apr  4 14:20 s.yaml
-rw-r--r-- 1 root root   2185 Apr  4 13:18 server.js
-rw-r--r-- 1 root root    541 Apr  3 20:48 tsconfig.json
```

## 查看镜像的文件系统

查看镜像的文件系统与查看失败容器的文件系统类似，只需要运行容器的shell即可，命令如下

```shell
docker run -it --rm --entrypoint sh aikit-web:latest
```
