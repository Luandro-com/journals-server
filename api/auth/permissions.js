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
    payedArticles: and(isAuthenticated, isAdmin),
  },
  Mutation: {
    updateUser: and(isAuthenticated),
    login: not(isAuthenticated),
    createArticle: and(isAuthenticated),
    publishArticle: and(isAuthenticated),
    deleteArticle: and(isAuthenticated),
    payment: and(isAuthenticated),
    updateUsersRoles: and(isAuthenticated, isAdmin),
    createEdition: and(isAuthenticated, or(isAdmin, isEditor)),
    publishEdition: and(isAuthenticated, or(isAdmin, isEditor)),
    publishEditionCall: and(isAuthenticated, or(isAdmin, isEditor)),
    updateEdition: and(isAuthenticated, or(isAdmin, isEditor)),
    deleteEdition: and(isAuthenticated, or(isAdmin, isEditor)),
    // selectEditorial: and(isAuthenticated, or(isAdmin, isEditor)),
    selectArticles: and(isAuthenticated, or(isAdmin, isEditor)),
    unselectArticles: and(isAuthenticated, or(isAdmin, isEditor)),

  },
}, {
  allowExternalErrors: true
})