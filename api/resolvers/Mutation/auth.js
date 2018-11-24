const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getUserId } = require('../../auth/utils')

const auth = {
  async signup(parent, args, ctx, info) {
    const password = await bcrypt.hash(args.password, 10)
    let user
    if(args.cart) {
      user = await ctx.db.mutation.createUser({
        data: { ...args, password, cart: { connect: { id: args.cart.id } } },
      })
    } else {
      user = await ctx.db.mutation.createUser({
        data: { ...args, password, cart: { create: {} } },
      })
    }
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

  async updateUser(parent, { input: { firstName, lastName, image } }, ctx, info) {
    const user = await ctx.db.mutation.updateUser({
      data: { firstName, lastName, image },
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
