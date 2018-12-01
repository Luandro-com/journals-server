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
  async publishIssueCall(parent, { issueId }, ctx, info) {
    try {
      return await ctx.db.mutation.updateIssue({
        where: { id: issueId },
        data: { publishedCall: true }
      }, info)
    } catch (err) { throw err }
  },
  async publishIssue(parent, { issueId }, ctx, info) {
    try {
      const IssueInfo = await ctx.db.query.issue({ where: { id: issueId } }, `{ publishedCall selectedArticles { id }}`)
      if (IssueInfo.selectedArticles.length > 0 && IssueInfo.publishedCall) return await ctx.db.mutation.updateIssue({
        where: { id: issueId },
        data: { published: true }
      }, info)
      else throw 'No articles selected or call not published'
    } catch (err) { throw err }
  },
  async updateIssue(parent, { issueId, input }, ctx, info) {
    try {
      return await ctx.db.mutation.updateIssue({
        where: { id: issueId },
        data: { ...input }
      }, info)
    } catch (err) { throw err }
  },
  async deleteIssue(parent, { issueId }, ctx, info) {
    try {
      return await ctx.db.mutation.deleteIssue({
        where: { id: issueId }
      }, info)
    } catch (err) { throw err }
  },
  async selectEditorial(parent, { articleId, issueId }, ctx, info) {
    try {
      return await ctx.db.mutation.updateIssue({
        data: { selectedEditorials: { connect: [ { id: articleId } ]}},
        where: { id: issueId },
      }, info)
    } catch (err) { throw err }
  },
  async unselectEditorial(parent, { articleId, issueId }, ctx, info) {
    try {
      return await ctx.db.mutation.updateIssue({
        data: { selectedEditorials: { disconnect: [ { id: articleId } ]}},
        where: { id: issueId },
      }, info)
    } catch (err) { throw err }
  },
  async selectArticles(parent, { articleIds, issueId }, ctx, info) {
    const validarticleIds = articleIds.map(a => {
      return {
        id: a
      }
    })
    try {
      return await ctx.db.mutation.updateIssue({
        where: { id: issueId },
        data: { selectedArticles: { connect: validarticleIds } },
      }, info)
    } catch (err) { throw err }
  },
  async unselectArticles(parent, { articleIds, issueId }, ctx, info) {
    const validArticleIds = articleIds.map(a => {
      return {
        id: a
      }
    })
    try {
      return await ctx.db.mutation.updateIssue({
        where: { id: issueId },
        data: { selectedArticles: { disconnect: validArticleIds } },
      }, info)
    } catch (err) { throw err }
  },
}

module.exports = { admin }
