# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.12.1
FROM node:${NODE_VERSION}-alpine

RUN apk add python3 g++ make

WORKDIR /usr/src/app

# Copy the rest of the source files into the image.
COPY . .

# Install the dependencies
RUN yarn install
RUN yarn build

# Expose the port that the application listens on.
EXPOSE 1234

# Run the application.
CMD yarn dev
