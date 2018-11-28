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

  async edition(parent, { editionKey }, ctx, info) {
    return await ctx.db.query.edition({ where: { key: editionKey } }, info)
  },

  async editions(parent, args, ctx, info) {
    return await ctx.db.query.editions({ where: { OR: [
      { published: true },
      { publishedCall: true },
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
