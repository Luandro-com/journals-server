const fs = require('fs')
const mkdirp = require('mkdirp')

const UPLOAD_DIR = './.uploads'

const storeFS = ({ stream }, path) => {
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file
          fs.unlinkSync(path)
        reject(error)
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve(path))
  )
}

module.exports = async (upload, db, info) => {
  try {
    mkdirp.sync(UPLOAD_DIR)
    const { stream, filename, mimetype } = await upload
    const res = await db.mutation.createFile({
      data: { mimetype, filename }
    }, `{ id }`)
    const storagePath = `${UPLOAD_DIR}/${res.id}-${filename}`
    const path = await storeFS({ stream }, storagePath)
    return await db.mutation.updateFile({
      where: { id: res.id },
      data: {
        path,
      }
    }, info)
  }
  catch (err) { throw err }
}