const { GraphQLUpload } = require('graphql-upload')
const { Query } = require('./Query')
const { Subscription } = require('./Subscription')
const { auth } = require('./Mutation/auth')
const { admin } = require('./Mutation/admin')
const { journal } = require('./Mutation/journal')
const { upload } = require('./Mutation/upload')
const { AuthPayload } = require('./AuthPayload')
module.exports = {
  Query,
  Mutation: {
    ...auth,
    ...admin,
    ...journal,
    ...upload,
  },
  // Subscription,
  AuthPayload,
  Upload: GraphQLUpload,
  Node: {
    __resolveType() {
      return null;
    }
  }
}
