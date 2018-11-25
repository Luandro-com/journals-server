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
  async createEdition(parent, { userIds, role }, ctx, info) {
    const res = await ctx.db.mutation.updateManyUsers({
      data: { role },
      where: { id_in: userIds }
    })
    if (res) return res.count
  },
}

module.exports = { admin }
