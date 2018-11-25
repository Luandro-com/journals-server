const test = require('tape')
const mockFetch = require('./fetch')
const validator = require('validator')
const faker = require('faker')

const testEmails = [ 'admin@example.com', 'editor@example.com', 'reader@example.com' ]
const testPassword = 'nooneknows'
let tokens = {
  admin: '',
  reader: '',
  editor: '',
}
let userId

module.exports = () => {
  test.onFinish(() => process.exit(0))
  // LOGIN AS ADMIN, EDITOR and USER
  test(`should login and return users with ADMIN, EDITOR and READER roles`, (t) => {
    t.plan(testEmails.length)
    const login = `
      mutation($email: String! $password: String!) {
        login(email: $email password: $password) {
          token
          user {
            id
            email
            role
          }
        }
      }
    `
    testEmails.forEach(email => mockFetch(login, { email, password: testPassword })
      .then(res => {
        const type = email.split('@')[0]
        tokens[type] = res.login.token // Set token for future requests
        t.equal(type.toLocaleUpperCase(), res.login.user.role)
        if (type === 'reader') {
          userId = res.login.user.id
        }
      })
    )
  })
  // USERS
  test(`Should get all non-admin users if admin and fail if editor or user`, (t) => {
    t.plan(testEmails.length)
    const users = `{
      users {
        id
        role
      }
    }`
    mockFetch(users, null, tokens.admin)
      .then(res => {
        const readerRoles = res.users.filter(user => user.role === 'READER' || user.role === 'AUTHOR')
        t.deepEqual(res.users, readerRoles)
      })
    mockFetch(users, null, tokens.editor)
      .then(res => {
        t.false(res.users)
      })
    mockFetch(users, null, tokens.reader)
      .then(res => {
        t.false(res.users)
      })
  })
  // ADMINS
  test(`Should get all users with ADMIN role if admin and fail if editor or user`, (t) => {
    t.plan(testEmails.length)
    const admins = `{
      admins {
        id
        role
      }
    }`
    mockFetch(admins, null, tokens.admin)
      .then(res => {
        const adminUsers = res.admins.filter(user => {
          return (user.role === 'EDITOR' || user.role === 'ADMIN')
        })
        t.deepEqual(res.admins, adminUsers)
      })
    mockFetch(admins, null, tokens.editor)
      .then(res => {
        t.false(res.admins)
      })
    mockFetch(admins, null, tokens.reader)
      .then(res => {
        t.false(res.admins)
      })
  })
  // PAYMENTS
  test(`Should get all payments if admin and fail if editor or reader`, (t) => {
    t.plan(testEmails.length)
    const payments = `{
      payments {
        id
        amount
        customer {
          email
        }
      }
    }`
    mockFetch(payments, null, tokens.admin)
      .then(res => {
        t.equal(true, validator.isEmail(res.payments[0].customer.email))
      })
    mockFetch(payments, null, tokens.editor)
      .then(res => {
        t.false(res.payments)
      })
    mockFetch(payments, null, tokens.reader)
      .then(res => {
        t.false(res.payments)
      })
  })
  // PAYED ARTICLES
  test(`Should get all payed articles if admin and fail if editor or reader`, (t) => {
    t.plan(testEmails.length)
    const payedArticles = `{
      payedArticles {
        id
      }
    }`
    mockFetch(payedArticles, null, tokens.admin)
      .then(res => {
        t.ok(res.payedArticles)
      })
    mockFetch(payedArticles, null, tokens.editor)
      .then(res => {
        t.false(res.payedArticles)
      })
    mockFetch(payedArticles, null, tokens.reader)
      .then(res => {
        t.false(res.payedArticles)
      })
  })
  // UNPAID ARTICLES
  // UPDATE USERS ROLES
  test(`Should update user role to AUTHOR and back to READER if admin and fail if editor or user`, (t) => {
    const updateUsersRoles = `
      mutation($userIds: [ID] $role: Role!) {
        updateUsersRoles(userIds: $userIds role: $role)
      }
    `

    mockFetch(updateUsersRoles, { userIds: [ userId ], role: 'AUTHOR' }, tokens.admin)
      .then(res => {
        console.log('res', res)
        t.ok(res.updateUsersRoles)
        mockFetch(updateUsersRoles, { userIds: [ userId ], role: 'READER' }, tokens.admin)
          .then(response => {
            t.ok(response)
            t.end()
          })
      })
    mockFetch(updateUsersRoles, { userIds: [ userId ], role: 'EDITOR' }, tokens.editor)
      .then(res => {
        t.false(res.updateUsersRoles)
      })
    mockFetch(updateUsersRoles, { userIds: [ userId ], role: 'EDITOR' }, tokens.reader)
      .then(res => {
        t.false(res.updateUsersRoles)
      })
  })
  // CREATE EDITION
  // test(`Should create an unpublished edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
  //   t.plan(testEmails.length)
  //   const createEdition = `{
  //     createEdition {
        
  //     }
  //   }`
  //   mockFetch(createEdition, null, tokens.admin)
  //     .then(res => {
  //       t.ok(res.createEdition)
  //     })
    // mockFetch(createEdition, null, tokens.editor)
    //   .then(res => {
    //     t.false(res.createEdition)
    //   })
    // mockFetch(createEdition, null, tokens.reader)
    //   .then(res => {
    //     t.false(res.createEdition)
    //   })
  // })
  // PUBLISH EDITION
  // DELETE EDITION
  // ADD ARTICLES TO EDITION
}