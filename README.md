<h1 align="center"><strong>Ewe GraphQL Server</strong></h1>

<br />

![](https://imgur.com/lIi4YrZ.png)



## Requirements

Make sure you have [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/) installed.

Simply run `npm i` and `docker-compose up -d` to start the Prisma and GraphQL Yoga servers, and the Postgres database.

The main point-of-entry is the Yoga GraphQL server which will be running on `http://localhost:4000`.

The Prisma server is also exposed on `http://localhost:4466`