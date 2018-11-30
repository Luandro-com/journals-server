const { getUserId } = require('../../services/auth/utils'
)
const admin = {
  async updateUsersRoles(parent, { userIds, role }, ctx, info) {
    const res = await ctx.db.mutation.updateManyUsers({
      data: { role },
      where: { id_in: userIds }
    })
    if (res) return res.count
  },
  async createIssue(parent, { input }, ctx, info) {
    try {
      return await ctx.db.mutation.createIssue({
        data: { ...input }
      }, info)
    } catch (err) { throw err }
  },
  async publishIssueCall(parent, { IssueId }, ctx, info) {
    try {
      return await ctx.db.mutation.updateIssue({
        where: { id: IssueId },
        data: { publishedCall: true }
      }, info)
    } catch (err) { throw err }
  },
  async publishIssue(parent, { IssueId }, ctx, info) {
    try {
      const IssueInfo = await ctx.db.query.issue({ where: { id: IssueId } }, `{ publishedCall selectedArticles { id }}`)
      if (IssueInfo.selectedArticles.length > 0 && IssueInfo.publishedCall) return await ctx.db.mutation.updateIssue({
        where: { id: IssueId },
        data: { published: true }
      }, info)
      else throw 'No articles selected or call not published'
    } catch (err) { throw err }
  },
  async updateIssue(parent, { IssueId, input }, ctx, info) {
    try {
      return await ctx.db.mutation.updateIssue({
        where: { id: IssueId },
        data: { ...input }
      }, info)
    } catch (err) { throw err }
  },
  async deleteIssue(parent, { IssueId }, ctx, info) {
    try {
      return await ctx.db.mutation.deleteIssue({
        where: { id: IssueId }
      }, info)
    } catch (err) { throw err }
  },
  async selectEditorial(parent, { articleId, IssueId }, ctx, info) {
    try {
      return await ctx.db.mutation.updateIssue({
        data: { selectedEditorials: { connect: [ { id: articleId } ]}},
        where: { id: IssueId },
      }, info)
    } catch (err) { throw err }
  },
  async unselectEditorial(parent, { articleId, IssueId }, ctx, info) {
    try {
      return await ctx.db.mutation.updateIssue({
        data: { selectedEditorials: { disconnect: [ { id: articleId } ]}},
        where: { id: IssueId },
      }, info)
    } catch (err) { throw err }
  },
  async selectArticles(parent, { articleIds, IssueId }, ctx, info) {
    const validarticleIds = articleIds.map(a => {
      return {
        id: a
      }
    })
    try {
      return await ctx.db.mutation.updateIssue({
        where: { id: IssueId },
        data: { selectedArticles: { connect: validarticleIds } },
      }, info)
    } catch (err) { throw err }
  },
  async unselectArticles(parent, { articleIds, IssueId }, ctx, info) {
    const validArticleIds = articleIds.map(a => {
      return {
        id: a
      }
    })
    try {
      return await ctx.db.mutation.updateIssue({
        where: { id: IssueId },
        data: { selectedArticles: { disconnect: validArticleIds } },
      }, info)
    } catch (err) { throw err }
  },
}

module.exports = { admin }
