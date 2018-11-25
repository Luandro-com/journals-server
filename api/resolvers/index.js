const { Query } = require('./Query')
const { Subscription } = require('./Subscription')
const { auth } = require('./Mutation/auth')
const { admin } = require('./Mutation/admin')
const { journal } = require('./Mutation/journal')
const { AuthPayload } = require('./AuthPayload')

module.exports = {
  Query,
  Mutation: {
    ...auth,
    ...admin,
    ...journal,
  },
  // Subscription,
  AuthPayload,
  Node: {
    __resolveType() {
      return null;
    }
  }
}
