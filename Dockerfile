FROM node:8

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json /usr/app/
RUN npm install
COPY . /usr/app
EXPOSE 3005

CMD ["npm", "start"]