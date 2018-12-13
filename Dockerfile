FROM node:8

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json /usr/app/
COPY .env /usr/app/
RUN npm install
COPY . /usr/app
EXPOSE 4000

CMD ["npm", "start"]