const { localUpload } = require('../../services/upload')

module.exports = async (parent, { file }, ctx, info) => {
  if (!process.env.PRODUCTION) {
    throw 'NOT READY FOR PRODUCTION'
  } else {
    console.log('FILE', file)
    const res = await localUpload(file, ctx.db, info)
    console.log('LOCAL UPLOAD', res)
    return res
  }
}
