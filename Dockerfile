FROM node:latest
ADD . /code
WORKDIR /code

RUN npm install

CMD ["node", "server/index.js"]
