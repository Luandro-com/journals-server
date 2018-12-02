const aws = require('aws-sdk')
const uuid = require('uuid')

const s3 = new aws.S3({
  s3ForcePathStyle: true,
  accessKeyId: process.env.S3_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_AWS_SECRET_ACCESS_KEY,
  params: {
    Bucket: process.env.S3_BUCKET_NAME
  },
  endpoint: new aws.Endpoint(process.env.S3_ENDPOINT)
})

exports.processUpload = async ( upload, ctx ) => {
  if (!upload) {
    return console.log('ERROR: No file received.')
  }
  
  const { stream, filename, mimetype, encoding } = await upload
  const key = uuid() + '-' + filename

  // Upload to S3
  const response = await s3
    .upload({
      Key: key,
      ACL: 'public-read',
      Body: stream
    }).promise()

  const url = response.Location

  // Sync with Prisma
  const data = {
    filename,
    mimetype,
    encoding,
    url,
  }

  const { id } = await ctx.db.mutation.createFile({ data }, ` { id } `)

  const file = {
    id,
    filename,
    mimetype,
    encoding,
    url,
    createdAt: new Date(Date.now()).toISOString(),
    updatedAt: new Date(Date.now()).toISOString(),
  }

  console.log('saved prisma file:')
  console.log(file)

  return file
}
