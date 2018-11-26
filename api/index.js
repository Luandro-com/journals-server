require('dotenv').config()
const { GraphQLServer } = require('graphql-yoga')
const cors = require('cors')
const { Prisma } = require('prisma-binding')
const { sentry } = require('graphql-middleware-sentry')
// const { graphqlUploadExpress } = require('graphql-upload')
// const { forward } = require('graphql-middleware-forward-binding')
const permissions = require('./auth/permissions')

const db = new Prisma({
  typeDefs: 'api/generated/prisma.graphql', // the auto-generated GraphQL schema of the Prisma API
  endpoint: process.env.PRISMA_ENDPOINT, // the endpoint of the Prisma API (value set in `.env`)
  debug: true, // log all GraphQL queries & mutations sent to the Prisma API
  secret: process.env.PRISMA_SECRET, // only needed if specified in `database/prisma.yml` (value set in `.env`)
})

const server = new GraphQLServer({
  middlewares: [
    process.env.SENTRY_DSN ? sentry({
      dsn: process.env.SENTRY_DSN
    }) : {},
    permissions,
   ],
  typeDefs: './api/schema.graphql',
  resolvers: require('./resolvers'),
  context: req => ({
    ...req,
    db
  }),
  uploads: { maxFileSize: 10000000, maxFiles: 10 }
})

server.use(cors())

server.start(() => console.log('Server is running on http://localhost:4000'))
