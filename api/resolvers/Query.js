const { getUserId } = require('../auth/utils')

const Query = {
  user(parent, args, ctx, info) {
    const id = getUserId(ctx)
    return ctx.db.query.user({ where: { id } }, info)
  },

  async content(parent, args, ctx, info) {
    const res = await ctx.db.query.contents({}, info)
    return res[0]
  },

  async editions(parent, args, ctx, info) {
    return await ctx.db.query.editions({ where: { published: true }}, info)
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
}

module.exports = { Query }
