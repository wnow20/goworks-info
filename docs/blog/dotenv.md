# dotenv 环境变量

[dotenv](https://github.com/motdotla/dotenv) 是一个独立的node模块，用于从 `.env` 中加载环境变量到 `[process.env](https://nodejs.org/dist/latest-v18.x/docs/api/process.html#processenv)`。


## 安装

### 必要条件
`dotenv`一般用于node项目，因此你需要把它安装到你的项目空间中，如果你还没有项目空间，那么一下命令将为你新建一个。

```sh
# 新建 my-favor-project
mkdir my-favor-project && cd my-favor-project
npm init
```
然后一路回车，你讲生成一个 `package.json` 文件


### 添加 dotenv 依赖
```sh
# 安装到你的项目环境
npm install dotenv --save
```

### 添加变量
在 .env 中添加环境变量

```sh
cat <<EOT >> .env
# S3 Bucket配置
S3_BUCKET="test bucket"
# 你的密钥
SECRET_KEY="test secretKey"
EOT
cat .env
```

### 使用变量
```sh
cat <<EOT >> index.js
require('dotenv').config()
console.log(process.env.S3_BUCKET);
console.log(process.env.SECRET_KEY);
EOT
```

...或者使用ES6
```sh
import * as dotenv from 'dotenv'
dotenv.config()
console.log(process.env.S3_BUCKET);
console.log(process.env.SECRET_KEY);
```

### 使用多个配置文件
修改 index.js 文件为一下内容:
```js
console.log(process.env.NODE_ENV);
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
console.log(process.env.S3_BUCKET);
console.log(process.env.SECRET_KEY);
```

增加生产环境的配置
```sh
cat <<EOT >> .env.production
# S3 Bucket配置
S3_BUCKET="production bucket"
# 你的密钥
SECRET_KEY="production secretKey"
EOT
cat .env.production
```

查看效果
```sh
export NODE_ENV=production && node index.js
```

