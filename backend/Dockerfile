# Use Node.js 18 (matching package.json engine)
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (using wildcards to catch package-lock.json if it exists)
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose the port (usually 5000 or 8080 depending on server.js)
EXPOSE 5000

# Start the application
CMD [ "npm", "start" ]
