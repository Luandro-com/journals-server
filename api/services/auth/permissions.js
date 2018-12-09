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
    // user: and(isAuthenticated),
    allIssues: and(isAuthenticated, or(isAdmin, isEditor)),
    users: and(isAuthenticated, isAdmin),
    admins: and(isAuthenticated, isAdmin),
    payments: and(isAuthenticated, isAdmin),
    articles: and(isAuthenticated, or(isAdmin, isEditor)),
    uploads: and(isAuthenticated, or(isAdmin, isEditor)),
  },
  Mutation: {
    updateUser: and(isAuthenticated),
    // login: not(isAuthenticated),
    createArticle: and(isAuthenticated),
    updateArticle: and(isAuthenticated),
    publishArticle: and(isAuthenticated),
    deleteArticle: and(isAuthenticated),
    payment: and(isAuthenticated),
    updateUsersRoles: and(isAuthenticated, isAdmin),
    createIssue: and(isAuthenticated, or(isAdmin, isEditor)),
    publishIssue: and(isAuthenticated, or(isAdmin, isEditor)),
    publishIssueCall: and(isAuthenticated, or(isAdmin, isEditor)),
    updateIssue: and(isAuthenticated, or(isAdmin, isEditor)),
    deleteIssue: and(isAuthenticated, or(isAdmin, isEditor)),
    selectEditorial: and(isAuthenticated, or(isAdmin, isEditor)),
    unselectEditorial: and(isAuthenticated, or(isAdmin, isEditor)),
    selectArticles: and(isAuthenticated, or(isAdmin, isEditor)),
    unselectArticles: and(isAuthenticated, or(isAdmin, isEditor)),
    updateContent: and(isAuthenticated, isAdmin),
    renameFile: and(isAuthenticated, isAdmin),
    deleteFile: and(isAuthenticated, isAdmin),
  },
}, {
  allowExternalErrors: true
})