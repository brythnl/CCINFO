FROM node:18.18.2-slim

WORKDIR /app

RUN apt-get update -y && apt-get upgrade -y

COPY package*.json ./

RUN npm install && npm cache clean force

COPY . .

ENV PATH ./node_modules/.bin/:$PATH

EXPOSE 3000
