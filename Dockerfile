FROM node:18-alpine

WORKDIR /app

# Clean slate
RUN rm -rf node_modules package-lock.json

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]


# dockerfile
# FROM node:18-alpine

# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Clear npm cache and install dependencies
# RUN npm cache clean --force
# RUN npm ci 

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "start"]
