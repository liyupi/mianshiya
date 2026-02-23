# Interview Duck Backend Node Version

> Node + Express framework, recommended for this overall backend.

## Rapid Development

Enter the directory and install dependencies:

```
yarn
```

### Start the Service

> Remember to replace the MongoDB and Redis addresses in the config with your own

Start in the test environment:

```
npm run start:dev
```

Start in the production environment:
```
npm run start
```

## Deployment and Release

### Write Dockerfile

```dockerfile
# Use the official Node.js 12 lightweight image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Define the working directory
WORKDIR /usr/src/app

# Copy dependency definition files to the working directory
COPY package*.json ./

# Install dependencies in production mode
RUN npm install --only=production

# Copy local code to the working directory
COPY ../function-to-run ./

# Start the service
CMD [ "node", "server.js" ]
```

### Upload Code Package

Compress all files in the directory into a zip:

![](https://main.qcloudimg.com/raw/2f7b3d10472cb95f7a87691a679e1ef6.png)

Enter WeChat Cloud Hosting, create an environment and service, then release a version.

- Upload method is local code
- Attachment type is ZIP compressed package (the package generated in the previous step)
- Listening port is 3000

![](https://main.qcloudimg.com/raw/42ff035c940850d5e4b7915a0a17f40c.png)

Then click OK to create a version. Subsequent release processes can refer to the WeChat Cloud Hosting documentation.

## Advantages Over Cloud Functions

1. Better search and debugging experience
2. Easier to distinguish multiple environments
3. Code is more reusable
4. Easier to encapsulate logic
5. Costs are relatively controllable, less prone to being abused
6. More secure
7. Easier to migrate to other web frameworks