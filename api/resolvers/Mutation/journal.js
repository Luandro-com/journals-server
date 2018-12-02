const camel = require('camelcase')
const { getUserId } = require('../../services/auth/utils')
const { simpleTransaction } = require('../../services/payment')

const journal = {
  async subscribe(parent, args, ctx, info) {
    const id = getUserId(ctx)
    const { email } = await ctx.db.query.user({ where: { id }})
    await ctx.db.mutation.createNewsletterSubscription({
      data: { email }
    })
    return true
  },

  async unsubscribe(parent, args, ctx, info) {
    const id = getUserId(ctx)
    const { email } = await ctx.db.query.user({ where: { id }})
    await ctx.db.mutation.deleteNewsletterSubscription({
      where: { email }
    })
    return true
  },

  async createArticle(parent, { input }, ctx, info) {
    let validInputs = {}
    Object.keys(input).filter(k => {
      if (k !== 'issueId') {
        validInputs[k] = input[k]
      }
    })
    const id = getUserId(ctx)
    return await ctx.db.mutation.createArticle({
      data: {
        ...validInputs,
        author: {
          connect: {
            id
          }
        },
        issue: {
          connect: {
            id: input.issueId
          }
        }
      }
    }, info)
  },

  async publishArticle(parent, { articleId }, ctx, info) {
    const userId = getUserId(ctx)
    const article = await ctx.db.query.article({ where: { id: articleId } }, `{ author { id }}`)
    const belongs = article.author.id === userId
    if (belongs) return await ctx.db.mutation.updateArticle({
      where: { id: articleId },
      data: { published: true }
    }, info)
    else throw 'Not Authorized'

  },

  async deleteArticle(parent, { articleId }, ctx, info) {
    const userId = getUserId(ctx)
    const article = await ctx.db.query.article({ where: { id: articleId } }, `{ author { id }}`)
    const belongs = article.author.id === userId
    if (belongs) return await ctx.db.mutation.deleteArticle({
      where: { id: articleId },
    }, info)
    else throw 'Not Authorized'
  },

  async updateContent(parent, { input }, ctx, info) {
    const update = await ctx.db.mutation.updateManyContents({
      where: { createdAt_not: "1900-01-01T00:00:00.263Z" },
      data: { ...input }
    }, `{ count }`)
    if (update.count === 1) {
      const contents = await ctx.db.query.contents({}, info)
      return contents[0]
    } else {
      throw 'Error on updating content.'
    }
  },

  async payment(parent, args, ctx, info) {
    const { input } = args
    const id = getUserId(ctx)
    const articleId = input.articleId
    const payment = await simpleTransaction()
    let formatedPayment = { creditCard: {}}
    Object.keys(payment['Payment']).map(key => {
      if (key !== 'CreditCard') {
        formatedPayment[camel(key)] = payment['Payment'][key]
      } else {
        Object.keys(payment['Payment'][key]).map(creditKey => {
          formatedPayment[camel(key)][camel(creditKey)] = payment['Payment'][key][creditKey]
        })
        
      }
    })
    console.log('formatedPayment', formatedPayment)
    const {
      paymentId,
      type,
      currency,
      creditCard,
      tid,
      proofOfSale,
      authorizationCode,
      softDescriptor,
      provider,
      amount,
      serviceTaxAmount,
      installments,
      interest,
      capture,
      authenticate,
      recurrent,
      receivedDate,
      status,
      isSplitted,
      returnMessage,
      returnCode
    } = formatedPayment
    const card = await ctx.db.mutation.createCreditCard({
      data: creditCard
    })
    console.log('CREATED CARD ====> ', card)
    return await ctx.db.mutation.createPayment({
      data: {
        merchantOrderId: payment['MerchantOrderId'],
        customerName: payment['Customer']['Name'],
        article: { connect: { id: articleId } },
        customer: { connect: { id } },
        creditCard: { connect: { id: card.id }},
        paymentId,
        type,
        currency,
        tid,
        proofOfSale,
        authorizationCode,
        softDescriptor,
        provider,
        amount,
        serviceTaxAmount,
        installments,
        interest,
        capture,
        authenticate,
        recurrent,
        receivedDate: new Date(receivedDate),
        status,
        isSplitted,
        returnMessage,
        returnCode,
      }
    })
  },
}

module.exports = { journal }
