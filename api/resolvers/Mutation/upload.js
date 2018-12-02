const { processUpload } = require('../../services/upload')

const upload = {
  async uploadFile(parent, { file }, ctx, info) {
    return await processUpload(await file, ctx)
  },

  async uploadFiles(parent, { files }, ctx, info) {
    return Promise.all(files.map(file => processUpload(file, ctx)))
  },

  async renameFile(parent, { id, name }, ctx, info) {
    return ctx.db.mutation.updateFile({ data: { name }, where: { id } }, info)
  },

  async deleteFile(parent, { id }, ctx, info) {
    return await ctx.db.mutation.deleteFile({ where: { id } }, info)
  },
}

module.exports = {
  upload
}

// module.exports = async (parent, { file }, ctx, info) => {
//   if (!process.env.NODE_ENV === 'production') {
//     throw 'NOT READY FOR PRODUCTION'
//   } else {
//     console.log('FILE', file)
//     const res = await localUpload(file, ctx.db, info)
//     console.log('LOCAL UPLOAD', res)
//     return res
//   }
// }
