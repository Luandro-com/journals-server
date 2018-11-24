const { rule, shield, and, or, not } = require('graphql-shield')
const { getUserId } = require('./utils')

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return getUserId(ctx) !== null
})

const isAdmin = rule()(async (parent, args, ctx, info) => {
  const id = getUserId(ctx)
  const user = await ctx.db.query.user({ where: { id }})
  return user.role === 'ADMIN'
})

const isEditor = rule()(async (parent, args, ctx, info) => {
  const id = getUserId(ctx)
  const user = await ctx.db.query.user({ where: { id }})
  return user.role === 'EDITOR'
})

module.exports = shield({
  Query: {
    user: and(isAuthenticated),
    users: and(isAuthenticated, isAdmin),
    admins: and(isAuthenticated, isAdmin),
    payments: and(isAuthenticated, isAdmin),
  },
  Mutation: {
    updateUser: and(isAuthenticated),
    login: not(isAuthenticated),
    createArticle: and(isAuthenticated),
    publishArticle: and(isAuthenticated),
    payment: and(isAuthenticated),
    // updateUserRole: and(isAuthenticated, isAdmin),
  },
}, {
  allowExternalErrors: true
})