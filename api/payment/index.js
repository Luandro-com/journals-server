const cielo = require('cielo')({
  'MerchantId': process.env.MERCHANT_ID,
  'MerchantKey': process.env.MERCHANT_KEY,
  // 'RequestId': 'xxxxxxx', // Opcional - Identificação do Servidor na Cielo
  'sandbox': true, // Opcional - Ambiente de Testes
  'debug': true // Opcional - Exibe os dados enviados na requisição para a Cielo
})

const dadosSale = {  
  "MerchantOrderId":"2014111703",
  "Customer":{  
     "Name":"Comprador crédito simples"
  },
  "Payment":{  
    "Type":"CreditCard",
    "Amount":2000,
    "Installments":1,
    "SoftDescriptor":"123456789ABCD",
    "CreditCard":{  
        "CardNumber":"0000000000000001",
        "Holder":"Teste Holder",
        "ExpirationDate":"12/2030",
        "SecurityCode":"123",
        "Brand":"Visa"
    }
  }
}

// // Simples
const simpleTransaction = async () => await cielo.creditCard.simpleTransaction(dadosSale)
// console.log(transaction)

// // Completa
// const transaction = await cielo.creditCard.completeTransaction(dadosSale);
// console.log(transaction);

// // Venda com auth
// const transaction = await cielo.creditCard.authenticationTransaction(dadosSale);
// console.log(transaction);

// // Venda com análise de fraude
// const transaction = await cielo.creditCard.fraudAnalysisTransaction(dadosSale);
// console.log(transaction);

// // Venda com card token
// const transaction = await cielo.creditCard.cardTokenTransaction(dadosSale);
// console.log(transaction);

// // Capturando venda
// var existingSale = {
//   paymentId: '01df6e28-6ddd-45db-a095-903c1adb170a',
//   amount: '15700'
// }
// const transaction = await cielo.creditCard.captureSaleTransaction(existingSale);
// console.log(transaction);

// // Cancelando venda
// const cancel = await cielo.creditCard.cancelSale(existingSale);
// console.log(cancel);

// // Compra débido
// var dadosDebit = {  
//   "MerchantOrderId":"2014121201",
//   "Customer":{  
//      "Name":"Comprador Cartão de débito"
//   },
//   "Payment":{  
//     "Type":"DebitCard",
//     "Amount":15700,
//     "ReturnUrl":"http://www.cielo.com.br",
//     "DebitCard":{  
//         "CardNumber":"4551870000000183",
//         "Holder":"Teste Holder",
//         "ExpirationDate":"12/2030",
//         "SecurityCode":"123",
//         "Brand":"Visa"
//     }
//   }
// }
// const transaction = await cielo.debitCard.simpleTransaction(dadosDebit);
// console.log(transaction);

// // Compra transferência
// var dadosTransfer = {  
//   "MerchantOrderId":"2014111706",
//   "Customer":
//   {  
//       "Name":"Comprador Transferência Eletronica"
//   },
//   "Payment":
//   {  
//       "Type":"EletronicTransfer",
//       "Amount":15700,
//       "Provider":"Bradesco",
//       "ReturnUrl":"http://www.banzeh.com.br"
//   }
// }

// const transaction = await cielo.bankSlip.simpleTransaction(dadosTransfer);
// console.log(transaction);

// // Compra boleto
// var dadosBoleto = {  
//   "MerchantOrderId":"2014111706",
//   "Customer":
//   {  
//       "Name":"Comprador Teste Boleto",
//       "Identity": "1234567890",
//       "Address":
//       {
//         "Street": "Avenida Marechal Câmara",
//         "Number": "160",  
//         "Complement": "Sala 934",
//         "ZipCode" : "22750012",
//         "District": "Centro",
//         "City": "Rio de Janeiro",
//         "State" : "RJ",
//         "Country": "BRA"
//       }
//   },
//   "Payment":
//   {  
//       "Type":"Boleto",
//       "Amount":15700,
//       "Provider":"INCLUIR PROVIDER",
//       "Address": "Rua Teste",
//       "BoletoNumber": "123",
//       "Assignor": "Empresa Teste",
//       "Demonstrative": "Desmonstrative Teste",
//       "ExpirationDate": "5/1/2015",
//       "Identification": "11884926754",
//       "Instructions": "Aceitar somente até a data de vencimento, após essa data juros de 1% dia."
//   }
// }

// const transaction = await cielo.boleto.sale(dadosBoleto);
// console.log(transaction);

module.exports = {
  cielo,
  dadosSale,
  simpleTransaction,
}