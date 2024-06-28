FROM node:latest
ADD . /code
WORKDIR /code

RUN npm install

RUN cd client && npm i && npm run build

CMD ["node", "server/index.js"]
