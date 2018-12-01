const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getUserId } = require('../../services/auth/utils')
const sendResetEmail = require('../../services/auth/resetmail')
const uuid = require("uuid")

const auth = {
  async signup(parent, args, ctx, info) {
    const password = await bcrypt.hash(args.password, 10)
    let user
    user = await ctx.db.mutation.createUser({
      data: { ...args, password },
    })
    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    }
  },

  async login(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email: ${email}`)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    }
  },

  async sendPasswordResetEmail(parent, { email }, ctx, info) {
    const user = await ctx.db.query.user({
      where: { email }
    })
    if (!user) {
      throw new Error(`Invalid user`)
    }
    const hash = uuid.v4()
    await ctx.db.mutation.createResetPasswordRequest({
      data: {
        email,
        hash,
      }
    })
    const success = await sendResetEmail(email, hash)
    return success
  },

  async resetPassword(parent, { password, hash }, ctx, info) {
    try {
      const { email, reset } = await ctx.db.query.resetPasswordRequest({
        where: { hash }
      }, `{ email reset }`)
      if (!email || reset) {
        throw new Error(`Invalid reset email ticket`)
      }
      const newPassword = await bcrypt.hash(password, 10)
      const user = await ctx.db.mutation.updateUser({
        data: { password: newPassword },
        where: { email }
      })
      if (!user) {
        throw new Error(`Invalid user`)
      }
      const closeTicket = await ctx.db.mutation.updateResetPasswordRequest({
        where: { hash },
        data: {
          reset: true
        }
      })
      if (!closeTicket) {
        throw new Error(`Error closing ticket`)
      }
      return true
    } catch(err) { throw err}
  },

  async updateUser(parent, { input }, ctx, info) {
    const user = await ctx.db.mutation.updateUser({
      data: { ...input },
      where: { id: getUserId(ctx) }
    })
    if (!user) {
      throw new Error(`You're not logged in.`)
    }
    console.log('returning', user)
    return user
  },
}

module.exports = { auth }
