const { getUserId } = require('../../auth/utils')
const { simpleTransaction, } = require('../../payment')
const camel = require('camelcase')

const journal = {
  async payment(parent, args, ctx, info) {
    const { input } = args
    const id = getUserId(ctx)
    const orderId = input.orderId
    delete input.orderId
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
        order: { connect: { id: orderId } },
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
