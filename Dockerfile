FROM node:lts as build 
COPY . /app 
WORKDIR /app
RUN npm install

ENTRYPOINT [ "npm", "start" ]
