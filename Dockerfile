# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.18.2
FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV key=production

# Create app directory and set permissions
WORKDIR /code

# Copy package files
COPY package*.json ./

# Install app dependencies as root
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

USER root

# Create and set correct permissions for the client directory
RUN mkdir -p /code/client/node_modules && \
    chown -R node:node /code

# Switch to a non-root user

# Build client
RUN cd client && npm install && npm run build

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["npm", "start"]
