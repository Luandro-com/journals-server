const camel = require('camelcase')
const { getUserId } = require('../../services/auth/utils')
const { simpleTransaction, boletoTransaction } = require('../../services/payment')

const formatPayment = (payment) => {
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
  return formatedPayment
}

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

  async createArticle(parent, { input, issueId, fileId, citationIds }, ctx, info) {
    // let validInputs = {}
    // Object.keys(input).filter(k => {
    //   if (k !== 'issueId') {
    //     validInputs[k] = input[k]
    //   }
    // })
    const id = getUserId(ctx)
    const file = fileId ? { connect: {
      id: fileId
    }} : {}
    const citations = citationIds ?
      citationIds.map(cId => {
        return {
          connect: {
            id: cId
          }
        }
      })
    : {}
    return await ctx.db.mutation.createArticle({
      data: {
        ...input,
        author: {
          connect: {
            id
          }
        },
        issue: {
          connect: {
            id: issueId
          }
        },
        file,
        citations,
      }
    }, info)
  },

  async updateArticle(parent, { input, articleId, fileId, citationIds }, ctx, info) {
    const id = getUserId(ctx)
    const file = fileId ? { connect: {
      id: fileId
    }} : {}
    const citations = citationIds ?
      citationIds.map(cId => {
        return {
          connect: {
            id: cId
          }
        }
      })
    : {}
    const user = await ctx.db.query.user({ where: { id } }, `{ articles { id } role }`)
    const isAuthor = user.articles.filter(a => a.id === articleId).length > 0
    if (isAuthor || user.role === 'ADMIN') {
      return await ctx.db.mutation.updateArticle({
        where: { id: articleId },
        data: {
          ...input,
          file,
          citations,
        }
      }, info)
    } else {
      throw 'User are not the author!'
    }
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
    const { articleId, method } = input
    if( method === 'CREDIT_CARD') {
      const payment = await simpleTransaction()
      const formatedPayment = formatPayment(payment)
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
    }
    if( method === 'MONEY_ORDER') {
      const payment = await  boletoTransaction()
      const formatedPayment = formatPayment(payment)
      console.log('BOLETO', formatedPayment)
      const {
        instructions,
        expirationDate,
        demonstrative,
        url,
        boletoNumber,
        barCodeNumber,
        digitableLine,
        assignor,
        address,
        identification,
        amount,
        receivedDate,
        provider,
        status,
        isSplitted,
        paymentId,
        type,
        currency,
      } = formatedPayment
      return await ctx.db.mutation.createPayment({
        data: {
          merchantOrderId: payment['MerchantOrderId'],
          customerName: payment['Customer']['Name'],
          article: { connect: { id: articleId } },
          customer: { connect: { id } },
          instructions,
          expirationDate,
          demonstrative,
          url,
          boletoNumber,
          barCodeNumber,
          digitableLine,
          assignor,
          identification,
          amount,
          receivedDate: new Date(receivedDate),
          provider,
          status,
          isSplitted,
          paymentId,
          type,
          currency,
        }
      }) 
    }
  },
}

module.exports = { journal }
