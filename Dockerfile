FROM node:10-alpine AS assets
RUN apk update && apk add yarn python g++ make && rm -rf /var/cache/apk/*
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN yarn install
RUN yarn caravel migrate
EXPOSE 8080
CMD [ "yarn", "start" ]
