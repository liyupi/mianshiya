# 使用官方 Node.js 12 轻量级镜像.
# https://hub.docker.com/_/node
FROM node:16-slim

# 定义工作目录
WORKDIR /usr/src/app

# 将本地代码复制到工作目录内
COPY ./ ./

RUN npm install

# 安装 pm2
RUN npm install pm2 -g

# 启动服务
CMD pm2-runtime 'npm start'
