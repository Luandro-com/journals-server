const { getUserId } = require('../../auth/utils'
)
const admin = {
  async updateUsersRoles(parent, { userIds, role }, ctx, info) {
    const res = await ctx.db.mutation.updateManyUsers({
      data: { role },
      where: { id_in: userIds }
    })
    if (res) return res.count
  },
  async createEdition(parent, { input }, ctx, info) {
    try {
      return await ctx.db.mutation.createEdition({
        data: { ...input }
      }, info)
    } catch (err) { throw err }
  },
  async publishEditionCall(parent, { editionId }, ctx, info) {
    try {
      return await ctx.db.mutation.updateEdition({
        where: { id: editionId },
        data: { publishedCall: true }
      }, info)
    } catch (err) { throw err }
  },
  async publishEdition(parent, { editionId }, ctx, info) {
    try {
      const editionInfo = await ctx.db.query.edition({ where: { id: editionId } }, `{ articles { id }}`)
      console.log('editionInfo', editionInfo)
      if (editionInfo.articles.length > 0) return await ctx.db.mutation.updateEdition({
        where: { id: editionId },
        data: { published: true }
      }, info)
      else throw 'No articles selected'
    } catch (err) { throw err }
  },
  async updateEdition(parent, { editionId, input }, ctx, info) {
    try {
      return await ctx.db.mutation.updateEdition({
        where: { id: editionId },
        data: { ...input }
      }, info)
    } catch (err) { throw err }
  },
  async deleteEdition(parent, { editionId }, ctx, info) {
    try {
      return await ctx.db.mutation.deleteEdition({
        where: { id: editionId }
      }, info)
    } catch (err) { throw err }
  },
  // async selectArticles(parent, { articleIds, editionId }, ctx, info) {
  //   try {
  //     return await ctx.db.mutation.updateEdition({
  //       where: { id: editionId }
  //     }, info)
  //   } catch (err) { throw err }
  // },
  // async unselectArticles(parent, { articleIds, editionId }, ctx, info) {
  //   try {
  //     return await ctx.db.mutation.updateEdition({
  //       where: { id: editionId }
  //     }, info)
  //   } catch (err) { throw err }
  // },
}

module.exports = { admin }
