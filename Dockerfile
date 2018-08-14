FROM node:10.8.0-alpine

RUN apk update  -q && \
    apk upgrade -q
    
RUN apk add --update curl && \
    rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install -q

COPY . ./

EXPOSE 7070

CMD ["node", "src/index.js" ]
