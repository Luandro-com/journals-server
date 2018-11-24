FROM node:8

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json /usr/app/
RUN npm install
RUN npm i -g prisma
COPY . /usr/app
RUN which prisma
RUN prisma deploy

CMD ["npm", "start"]