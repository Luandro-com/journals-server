const test = require('tape')
const mockFetch = require('./fetch')
const validator = require('validator')
const faker = require('faker')

const testEmail = faker.internet.email()
const testPassword = faker.internet.password()

let token

module.exports = () => {
  // SIGNUP
  test(`should signup and return a new user with email: ${testEmail} and password: ${testPassword}`, (t) => {
    const signUp = `
      mutation($email: String! $password: String!) {
        signup(email: $email password: $password) {
          token
          user {
            email
          }
        }
      }
    `
    const variables = {
      email: testEmail,
      password: testPassword
    }
    mockFetch(signUp, variables)
    .then(res => {
      console.log('RES', res)
      t.equal(true, validator.isEmail(res.signup.user.email))
      t.end()
    })
    .catch(err => console.log(err))
  })
  // LOGIN
  test(`should login and return user with email: ${testEmail} and password: ${testPassword}`, (t) => {
    const login = `
      mutation($email: String! $password: String!) {
        login(email: $email password: $password) {
          token
          user {
            email
          }
        }
      }
    `
    const variables = {
      email: testEmail,
      password: testPassword
    }
    mockFetch(login, variables)
    .then(res => {
      token = res.login.token // Set token for future requests
      t.equal(true, validator.isEmail(res.login.user.email))
      t.end()
    })
  })
  // USER
  test(`should return current user with token: ${token}`, (t) => {
    const user = `{
      user {
        email
      }
    }`
    mockFetch(user, null, token)
    .then(res => {
      t.equal(true, validator.isEmail(res.user.email))
      t.end()
    })
  })
  // READ EDITIONS
  test(`should return editions`, (t) => {
    const editions = `{
      editions {
        title
        articles {
          author {
            email
          }
        }
      }
    }`
    mockFetch(editions, null, token)
    .then(res => {
      t.equal(true, validator.isEmail(res.editions[0].articles[0].author.email))
      t.end()
    })
  })
  // READ CONTENT
  // SUBSCRIBE
  // UPDATE INFORMATION
  // CREATE JOURNAL
  // PUBLISH JOURNAL
  // PAYMENT
  // test(`should start payment for order ${orderId} and return payment`, (t) => {
  //   console.log('orderId', orderId)
  //   const payment = `
  //     mutation($input: PaymentInput!) {
  //       payment(input: $input) {
  //         id
  //         status
  //       }
  //     }
  //   `
  //   const variables = {
  //     input: {
  //       method: 'CREDIT',
  //       orderId: orderId
  //     }
  //   }
  //   mockFetch(payment, variables, token)
  //   .then(res => {
  //     t.equal(true, (res.payment.id !== null))
  //     t.end()
  //   })
  //   .catch(err => console.log(err))
  // })
}