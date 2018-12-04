const { getUserId } = require('../services/auth/utils')

const Query = {
  user(parent, args, ctx, info) {
    const id = getUserId(ctx)
    return ctx.db.query.user({ where: { id } }, info)
  },

  async content(parent, args, ctx, info) {
    const res = await ctx.db.query.contents({}, info)
    return res[0]
  },

  async issue(parent, { issueKey }, ctx, info) {
    return await ctx.db.query.issue({ where: { key: issueKey } }, info)
  },

  async article(parent, { articleId }, ctx, info) {
    const id = getUserId(ctx)
    const res = await ctx.db.query.articles({ 
      where: {
        AND: [
          { id: articleId },
          { OR: [
            { published: true },
            { author: { id } }
          ]},
        ]}
      }
    , info)
    if (res[0]) {
      return res[0]
    } else {
      throw 'Not found'
    }
  },

  async allIssues(parent, args, ctx, info) {
    return await ctx.db.query.issues({}, info)
  },

  async issues(parent, args, ctx, info) {
    return await ctx.db.query.issues({ where: { OR: [
      { published: true },
      { publishedCall: true },
    ] }}, info)
  },

  async openCalls(parent, args, ctx, info) {
    return await ctx.db.query.issues({ where: { AND: [
      { publishedCall: true },
      { endCall_gt: new Date(Date.now()).toISOString() }
    ] }}, info)
  },

  async users(parent, args, ctx, info) {
    return await ctx.db.query.users({ where: { role_in: ['READER', 'AUTHOR'] } }, info)
  },


  async admins(parent, args, ctx, info) {
    return await ctx.db.query.users({ where: { role_in: ['ADMIN', 'EDITOR'] } }, info)
  },
  

  async payments(parent, args, ctx, info) {
    return await ctx.db.query.payments({}, info)
  },

  async payedArticles(parent, args, ctx, info) {
    return await ctx.db.query.articles({ where: { payment: { returnCode: '4' } }}, info)
  },

  async uploads(parent, args, ctx, info) {
    return await ctx.query.files({}, info)
  }

}

module.exports = { Query }
