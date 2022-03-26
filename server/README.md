# 面试鸭后端 Node 版

> Node + Express 框架，推荐用这个整体后台。

## 快速开发

进入该目录，安装依赖：

```
yarn
```

### 启动服务

> 记得先把 config 中的 mongodb 和 redis 地址换成自己的

以测试环境启动：

```
npm run start:dev
```

以线上环境启动：
```
npm run start
```

## 部署发布

### 编写 Dockerfile

```dockerfile
# 使用官方 Node.js 12 轻量级镜像.
# https://hub.docker.com/_/node
FROM node:12-slim

# 定义工作目录
WORKDIR /usr/src/app

# 将依赖定义文件拷贝到工作目录下
COPY package*.json ./

# 以 production 形式安装依赖
RUN npm install --only=production

# 将本地代码复制到工作目录内
COPY ../function-to-run ./

# 启动服务
CMD [ "node", "server.js" ]
```

### 上传代码包

将目录下所有文件压缩为 zip：

![](https://main.qcloudimg.com/raw/2f7b3d10472cb95f7a87691a679e1ef6.png)

进入微信云托管，创建环境和服务，然后发布一个版本。

- 上传方式为本地代码
- 附件类型为 ZIP 压缩包（即上一步中产生的压缩包）
- 监听端口为 3000

![](https://main.qcloudimg.com/raw/42ff035c940850d5e4b7915a0a17f40c.png)

随后点击确定，即可创建一个版本，后续发布流程可以参考微信云托管文档。


## 相对于云函数的优点

1. 搜索调试爽
2. 便于区分多环境
3. 代码更容易复用
4. 便于自己封装逻辑
5. 成本相对可控，不容易被刷量
6. 更安全
7. 便于迁移成其他的 web 框架
