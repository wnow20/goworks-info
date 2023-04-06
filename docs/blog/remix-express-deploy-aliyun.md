# Remix如何部署阿里云函数FC

函数计算是事件驱动的全托管计算服务。使用函数计算，您无需采购与管理服务器等基础设施，只需编写并上传代码或镜像。函数计算为您准备好计算资源，弹性地、可靠地运行任务，并提供日志查询、性能监控和报警等功能。

因此对于独立开发者，再前期没有太多预算的情况下，使用无服务(Serverless)用于部署服务是一种很好的选择，接下来带你了解如何通过自定义容器镜像部署阿里云函数FC。

## 先决条件
首先你要有一个子项目，并支持构建Docker镜像，这里我们已经提供了演示代码，[github地址](https://github.com/wnow20/remix-express-aliyun) [Gitee地址](https://gitee.com/wnow20/remix-express-aliyun)
其次，你需要安装 [Serverless Devs](https://www.serverless-devs.com/) Serverless 应用全生命周期管理工具，并配置阿里云密钥，具体教程请看[Serverless Devs快速上手](https://docs.serverless-devs.com/serverless-devs/quick_start)

简单说明下这个项目，该项目使用 Remix 官方提供的脚手架生成工具 `npx create-remix@latest` 生成，后端服务基于Express，便于拓展，方便自定义功能。

### 设置Dockerfile文件
```设置Dockerfile
# base node image
FROM node:16-bullseye-slim as base

# 为Prisma安装openssl依赖
# 如果你需要Prisma依赖，请取消打开一下命令行
# RUN apt-get update && apt-get install -y openssl

# 为base镜像设置环境变量
ENV NODE_ENV=production

# 用于安装npm包
FROM base as deps

RUN mkdir /app
WORKDIR /app

ADD package.json package-lock.json ./
# 这里我们使用淘宝提供的国内镜像加速
RUN npm install --production=false --registry=https://registry.npmmirror.com/

# 用于设置运行环境依赖
FROM base as production-deps

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ADD package.json package-lock.json ./
RUN npm prune --production

# 用于构建应用
FROM base as build

RUN mkdir /app
WORKDIR /app

COPY --from=deps /app/node_modules /app/node_modules
ENV NODE_ENV=production

# 添加Prisma
# 如果你需要Prisma依赖，请取消打开一下命令行
# RUN npx prisma generate

ADD . .
RUN npm run build

# 最后，构建部署镜像
FROM base

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY --from=production-deps /app/node_modules /app/node_modules
# 如果你需要Prisma依赖，请取消打开一下命令行
#COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
ADD . .

CMD ["node", "server.js"]
```

## 打包镜像
```shell
# 构建镜像
docker build . -t remix-express-aliyun:latest
```

需要注意的是，在后面的阿里云FC部署时需要拉取镜像，因此需要把镜像上传到阿里镜像中心，因此我们需要：

- 在阿里云[镜像仓库](https://cr.console.aliyun.com/cn-hongkong/instance/repositories)，创建镜像
- docker命令登录阿里云
- 给镜像打上阿里云域名的tag
- 推送到阿里云镜像仓库

操作如下
```shell
# 本地执行，登录阿里云镜像仓库
$ docker login --username=tiansh******@126.com registry.cn-hongkong.aliyuncs.com

# 给镜像起阿里云的别名tag
docker tag [ImageId] registry.cn-hongkong.aliyuncs.com/goworks/remix-express-aliyun:[镜像版本号]

# 将镜像推送到Registry
docker push registry.cn-hongkong.aliyuncs.com/goworks/remix-express-aliyun:[镜像版本号]
```

另外，以上镜像仓库域名是 `cn-hongkong` 香港机房的，如果请跟你要部署应用的机房保持一致，避免部署服务时由于跨机房拉镜像导致网络延迟。

## 配置Serverless

配置Serverless我们推荐的做法是在项目中使用`yaml`文件的形式，而不是在阿里云FC控制台配置，这样便于版本管理。

s.yaml配置文件如下，此文件已经在我们的演示代码仓库中。[github地址](https://github.com/wnow20/remix-express-aliyun) [Gitee地址](https://gitee.com/wnow20/remix-express-aliyun)

```yaml
#      - Serverless Devs和FC组件的关系、如何声明/部署多个函数、超过50M的代码包如何部署
#      - 关于.fcignore使用方法、工具中.s目录是做什么、函数进行build操作之后如何处理build的产物
#   等问题，可以参考文档：https://www.serverless-devs.com/fc/tips
#   关于如何做CICD等问题，可以参考：https://www.serverless-devs.com/serverless-devs/cicd
#   关于如何进行环境划分等问题，可以参考：https://www.serverless-devs.com/serverless-devs/extend
#   更多函数计算案例，可参考：https://github.com/devsapp/awesome/
#   有问题快来钉钉群问一下吧：33947367
# ------------------------------------
edition: 1.0.0
name: remix-express-aliyun
# access 是当前应用所需要的密钥信息配置：
# 密钥配置可以参考：https://www.serverless-devs.com/serverless-devs/command/config
# 密钥使用顺序可以参考：https://www.serverless-devs.com/serverless-devs/tool#密钥使用顺序与规范
access: "default"

vars: # 全局变量
  region: "cn-hongkong"
  service:
    name: "remix-express-aliyun"
    description: 'description'

services:
  framework: # 业务名称/模块名称
    component: fc # 组件名称，Serverless Devs 工具本身类似于一种游戏机，不具备具体的业务能力，组件类似于游戏卡，用户通过向游戏机中插入不同的游戏卡实现不同的功能，即通过使用不同的组件实现不同的具体业务能力
    props:
      region: ${vars.region} # 关于变量的使用方法，可以参考：https://www.serverless-devs.com/serverless-devs/yaml#变量赋值
      service:
        name: ${vars.service.name}
        internetAccess: true
        vpcConfig:
          vpcId: vpc-j6cd0f9ubs4ydcv73g4u5
          securityGroupId: sg-j6c3qdr7ahk5so491vp0 # 安全组ID。
          vswitchIds:
            - vsw-j6cad13q1zhg2sqygd3lt # 请确保该vSwitch对应的网段已配置到数据库实例访问白名单中。
        logConfig:
          project: aliyun-fc-cn-hongkong-b7a683e3-fefe-5d89-8aba-98441329ba2f
          logstore: function-log
          enableRequestMetrics: true
          enableInstanceMetrics: true
          logBeginRule: DefaultRegex
      function:
        name: "web"
        description: 'http function by serverless devs'
        runtime: custom-container # 这是设置运行时为custom-container，用于部署开发者自己打的镜像
        codeUri: ./
        memorySize: 128
        caPort: 9000
        customContainerConfig:
          image: "registry.cn-hongkong.aliyuncs.com/goworks/remix-express-aliyun:0.0.2"
          accelerationType: None
        environmentVariables:
          FOO: "bar"
      triggers:
        - name: httpTrigger
          type: http
          # qualifier: LATEST    
          config:
            authType: anonymous
            methods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
      customDomains:
        - domainName: auto
          protocol: HTTP
          routeConfigs:
            - path: '/*'
              methods:
                - GET
                - POST
                - PUT
                - DELETE
                - OPTIONS

```


## 部署

使用 [Serverless Devs](https://www.serverless-devs.com/) 提供的终端命令即可部署，方便快捷
```shell
s deploy
```

以下是终端输出的部署结果，阿里云FC会自动为我们创建一个域名用于访问我们的服务。
```output
framework: 
  region:   cn-hongkong
  service: 
    name: remix-express-aliyun function: 
    name:       web
    runtime:    custom-container
    handler:    index.handler
    memorySize: 128
    timeout:    3
  url: 
    system_url:    https://web-remix-es-aliyun-wwttbptlli.cn-hongkong.fcapp.run
    custom_domain: 
      - 
        domain: http://web.remix-express-aliyun.1109595215468882.cn-hongkong.fc.devsapp.net
  triggers: 
    - 
      type: http
      name: httpTrigger
```

本文演示代码的访问链接为：http://web.remix-express-aliyun.1109595215468882.cn-hongkong.fc.devsapp.net
