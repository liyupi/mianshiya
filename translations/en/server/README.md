# Interview Duck Backend (Node Version)

> Built with Node + Express framework. Recommended as the complete backend solution.

## Quick Start

Enter the directory and install dependencies:

```
yarn
```

### Start the Service

> Remember to replace the MongoDB and Redis addresses in the config with your own

Start in development environment:

```
npm run start:dev
```

Start in production environment:
```
npm run start
```

## Deployment

### Dockerfile Configuration

```dockerfile
# Use official Node.js 12 lightweight image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Define working directory
WORKDIR /usr/src/app

# Copy dependency definition files to working directory
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy local code to working directory
COPY ../function-to-run ./

# Start the service
CMD [ "node", "server.js" ]
```

### Upload Code Package

Compress all files in the directory into a zip:

![](https://main.qcloudimg.com/raw/2f7b3d10472cb95f7a87691a679e1ef6.png)

Access WeChat CloudBase, create an environment and service, then release a version.

- Upload method: Local code
- Attachment type: ZIP package (the compressed file created in previous step)
- Listening port: 3000

![](https://main.qcloudimg.com/raw/42ff035c940850d5e4b7915a0a17f40c.png)

Click confirm to create a version. Subsequent release processes can refer to WeChat CloudBase documentation.

## Advantages Over Cloud Functions

1. Better search and debugging experience
2. Easier environment separation
3. More code reusability
4. Better for custom logic encapsulation
5. More controllable costs, less vulnerable to traffic abuse
6. Enhanced security
7. Easier migration to other web frameworks