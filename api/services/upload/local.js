const fs = require('fs')
// import mkdirp from 'mkdirp'

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
  // mkdirp.sync(UPLOAD_DIR)
  console.log('IM IN UPLOAD', upload)
  const { createReadStream, filename, mimetype } = await upload
  const stream = createReadStream()
  console.log('UPLOADING...', mimetype, filename, stream)
  const res = await db.mutation.createFile({
    data: { mimetype, filename }
  }, info)
  const storagePath = `${UPLOAD_DIR}/${res.id}-${filename}`
  const path = await storeFS({ stream }, storagePath)
  return await db.mutation.updateFile({
    where: { id: res.id },
    data: {
      path,
    }
  }, info)
}