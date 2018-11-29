require('dotenv').config()
const express = require('express')
const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server-express')
const { graphqlUploadExpress } = require('graphql-upload')
const cors = require('cors')
const { Prisma } = require('prisma-binding')
// const { sentry } = require('graphql-middleware-sentry')
const { importSchema } = require('graphql-import')

const permissions = require('./services/auth/permissions')
const importedTypeDefs = importSchema(__dirname + '/schema.graphql')
const typeDefs = gql`${importedTypeDefs}`
const resolvers = require('./resolvers')

const db = new Prisma({
  typeDefs: 'api/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  debug: process.env.PRODUCTION ? false : true,
  secret: process.env.PRISMA_SECRET,
})

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const server = new ApolloServer({
  schema,
  context: ({ req }) => ({
    req,
    db
  }),
  uploads: false,
})

const app = express()
app.use(cors())
app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
server.applyMiddleware({ permissions, app })

const port = process.env.PORT || 4000

app.listen({ port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`),
)

// // process.env.SENTRY_DSN ? sentry({
// //       dsn: process.env.SENTRY_DSN
// //     }) : {}
