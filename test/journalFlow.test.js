const test = require('tape')
const mockFetch = require('./fetch')
const validator = require('validator')
const faker = require('faker')

const testEmail = faker.internet.email()
const testPassword = faker.internet.password()

let token
let editionId
let articleId
let articleId2

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
  test(`should return editions that are published`, (t) => {
    const editions = `{
      editions {
        id
        title
        published
        publishedCall
        selectedArticles {
          id
        }
        selectedEditorials {
          id
        }
      }
    }`
    mockFetch(editions, null, token)
    .then(res => {
      console.log('RES', res)
      editionId = res.editions[0].id
      t.equal(true, res.editions.filter(e => (!e.published && !e.publishedCall)).length === 0)
      t.end()
    })
  })
  // READ CONTENT
  test(`should return content`, (t) => {
    const content = `{
      content {
        title
        about
      }
    }`
    mockFetch(content, null, token)
    .then(res => {
      t.ok(res.content)
      t.end()
    })
  })
  // SUBSCRIBE
  test(`should subscribe user to newsletter`, (t) => {
    const subscribe = `
      mutation {
        subscribe
      }
    `
    mockFetch(subscribe, null, token)
    .then(res => {
      t.ok(res.subscribe)
      t.end()
    })
  })
  // UNSUBSCRIBE
  test(`should unsubscribe user to newsletter`, (t) => {
    const unsubscribe = `
      mutation {
        unsubscribe
      }
    `
    mockFetch(unsubscribe, null, token)
    .then(res => {
      t.ok(res.unsubscribe)
      t.end()
    })
  })
  // UPDATE USER INFORMATION
  test(`should update user information`, (t) => {
    const updateUser = `
      mutation($input: UserInput!) {
        updateUser(input: $input) {
          email
          firstName
          lastName
        }
      }
    `
    const variables = {
      input: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        image: faker.image.avatar(),
        about: faker.name.jobDescriptor(),
        postalAddress: faker.address.secondaryAddress(),
        institution: faker.company.catchPhrase(),
        country: faker.address.country(),
        personalSite: faker.internet.domainName(),
      }
    }
    mockFetch(updateUser, variables, token)
    .then(res => {
      console.log('RES', res)
      t.equal(true, validator.isEmail(res.updateUser.email))
      t.end()
    })
    .catch(err => console.log(err))
  })
  // CREATE ARTICLE
  test(`should create a new unpublished article`, (t) => {
    const createArticle = `
      mutation($input: ArticleInput!) {
        createArticle(input: $input) {
          id
          published
        }
      }
    `
    const variables = {
      input: {
        editionId,
        file: faker.image.imageUrl(),
        title: faker.company.catchPhrase(),
        resume: faker.company.catchPhraseDescriptor(),
      }
    }
    mockFetch(createArticle, variables, token)
    .then(res => {
      console.log('RES', res)
      articleId = res.createArticle.id
      t.ok(res.createArticle)
      t.equal(false, res.createArticle.published)
      mockFetch(createArticle, variables, token)
        .then(response => {
          articleId2 = response.createArticle.id
          t.ok(articleId2)
          t.end()
        })
    })
    .catch(err => console.log(err))
  })
  // PUBLISH ARTICLE
  test(`should publish an unpublished article`, (t) => {
    const publishArticle = `
      mutation($articleId: ID!) {
        publishArticle(articleId: $articleId) {
          published
        }
      }
    `
    const variables = {
      articleId,
    }
    mockFetch(publishArticle, variables, token)
    .then(res => {
      console.log('RES', res)
      t.equal(true, res.publishArticle.published)
      t.end()
    })
    .catch(err => console.log(err))
  })
  // DELETE ARTICLE
  test(`should delete an article`, (t) => {
    const deleteArticle = `
      mutation($articleId: ID!) {
        deleteArticle(articleId: $articleId) {
          id
        }
      }
    `
    mockFetch(deleteArticle, { articleId: articleId2 }, token)
    .then(res => {
      t.equal(articleId2, res.deleteArticle.id)
      t.end()
    })
    .catch(err => console.log(err))
  })
  // PAYMENT
  test(`should start payment for article ${articleId} and return payment`, (t) => {
    const payment = `
      mutation($input: PaymentInput!) {
        payment(input: $input) {
          id
          status
        }
      }
    `
    const variables = {
      input: {
        method: 'CREDIT',
        articleId,
      }
    }
    mockFetch(payment, variables, token)
    .then(res => {
      t.equal(true, (res.payment.id !== null))
      t.end()
    })
    .catch(err => console.log(err))
  })
}