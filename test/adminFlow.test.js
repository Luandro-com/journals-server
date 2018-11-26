const test = require('tape')
const mockFetch = require('./fetch')
const validator = require('validator')
const faker = require('faker')
const camelcase = require('camelcase')

const testEmails = [ 'admin@example.com', 'editor@example.com', 'reader@example.com' ]
const testPassword = 'nooneknows'
let tokens = {
  admin: '',
  reader: '',
  editor: '',
}
let userId
let editionId
let editionId2
let articles

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
        articles = res.payedArticles.map(a => a.id)
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
  test(`Should create an unpublished edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const createEdition = `
      mutation($input: EditionInput!) {
        createEdition(input: $input) {
          id
        }
      }
    `
    const variables = {
      input: {
        title: faker.company.catchPhrase(),
        key: camelcase(faker.company.catchPhrase()),
        body: `<h1>Edição</h1>${faker.lorem.paragraphs()}`,
        evaluationPeriod: 60,
        publicationPrediction: new Date(Date.now() + 7000000).toISOString(),
        contact: faker.phone.phoneNumber(),
        startCall: new Date(Date.now() + 60000).toISOString(),
        endCall: new Date(Date.now() + 6000000).toISOString(),
      }
    }
    const variables2 = {
      input: {
        title: faker.company.catchPhrase(),
        key: camelcase(faker.company.catchPhrase()),
        body: `<h1>Edição</h1>${faker.lorem.paragraphs()}`,
        evaluationPeriod: 60,
        publicationPrediction: new Date(Date.now() + 7000000).toISOString(),
        contact: faker.phone.phoneNumber(),
        startCall: new Date(Date.now() + 60000).toISOString(),
        endCall: new Date(Date.now() + 6000000).toISOString(),
      }
    }
    mockFetch(createEdition, variables, tokens.admin)
      .then(res => {
        editionId = res.createEdition.id
        t.ok(res.createEdition)
      })
      .catch(err => console.log('ERRR;,', err))
    mockFetch(createEdition, variables2, tokens.editor)
      .then(res => {
        editionId2 = res.createEdition.id
        t.ok(res.createEdition)
      })
    mockFetch(createEdition, variables, tokens.reader)
      .then(res => {
        t.false(res.createEdition)
      })
  })
  // PUBLISH EDITION CALL
  test(`Should publish a call for existing edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const publishEditionCall = `
      mutation($editionId: ID!) {
        publishEditionCall(editionId: $editionId) {
          id
          publishedCall
        }
      }
    `
    mockFetch(publishEditionCall, { editionId }, tokens.admin)
      .then(res => {
        console.log('RES', res)
        t.equal(true, res.publishEditionCall.publishedCall)
      })
    mockFetch(publishEditionCall, { editionId: editionId2 }, tokens.editor)
      .then(res => {
        console.log('RES2', res)
        t.equal(true, res.publishEditionCall.publishedCall)
      })
    mockFetch(publishEditionCall, { editionId: editionId2 }, tokens.reader)
      .then(res => {
        t.false(res.publishEditionCall)
      })
  })
  // SELECT ARTICLES
  test(`Should select articles for edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const selectArticles = `
      mutation($articleIds: [ID]! $editionId: ID!) {
        selectArticles(editionId: $editionId articleIds: $articleIds) {
          id
          selectedArticles {
            id
          }
        }
      }
    `
    mockFetch(selectArticles, { articleIds: articles, editionId }, tokens.admin)
      .then(res => {
        t.deepEqual(articles, res.selectArticles.selectedArticles.map(a => a.id))
      })
    mockFetch(selectArticles,  { articleIds: articles, editionId: editionId2 }, tokens.editor)
      .then(res => {
        t.deepEqual(articles, res.selectArticles.selectedArticles.map(a => a.id))
      })
    mockFetch(selectArticles,  { articleIds: articles, editionId: editionId2 }, tokens.reader)
      .then(res => {
        t.false(res.selectArticles)
      })
  })
  // UNSELECT ARTICLES
  test(`Should select articles for edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const articlesLessOne = articles.filter((a, key) => key !== 0)
    console.log('articlesLessOne', articlesLessOne)
    const unselectArticles = `
      mutation($articleIds: [ID]! $editionId: ID!) {
        unselectArticles(editionId: $editionId articleIds: $articleIds) {
          id
          selectedArticles {
            id
          }
        }
      }
    `
    mockFetch(unselectArticles, { articleIds: articlesLessOne, editionId }, tokens.admin)
      .then(res => {
        t.equal(1, res.unselectArticles.selectedArticles.length)
      })
    mockFetch(unselectArticles,  { articleIds: articlesLessOne, editionId: editionId2 }, tokens.editor)
      .then(res => {
        t.equal(1, res.unselectArticles.selectedArticles.length)
      })
    mockFetch(unselectArticles,  { articleIds: articlesLessOne, editionId: editionId2 }, tokens.reader)
      .then(res => {
        t.false(res.unselectArticles)
      })
  })
  // SELECT EDITORIAL
  test(`Should select articles for edition editorial if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const selectEditorial = `
      mutation($articleId: ID! $editionId: ID!) {
        selectEditorial(editionId: $editionId articleId: $articleId) {
          id
          selectedEditorials {
            id
          }
        }
      }
    `
    mockFetch(selectEditorial, { articleId: articles[1], editionId }, tokens.admin)
      .then(res => {
        t.equal(1, res.selectEditorial.selectedEditorials.length)
      })
    mockFetch(selectEditorial,  { articleId: articles[1], editionId: editionId2 }, tokens.editor)
      .then(res => {
        t.equal(1, res.selectEditorial.selectedEditorials.length)
      })
    mockFetch(selectEditorial,  { articleId: articles[1], editionId: editionId2 }, tokens.reader)
      .then(res => {
        t.false(res.selectEditorial)
      })
  })
  // UNSELECT EDITORIAL
  test(`Should select articles for edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const unselectEditorial = `
      mutation($articleId: ID! $editionId: ID!) {
        unselectEditorial(editionId: $editionId articleId: $articleId) {
          id
          selectedEditorials {
            id
          }
        }
      }
    `
    mockFetch(unselectEditorial, { articleId: articles[1], editionId }, tokens.admin)
      .then(res => {
        t.equal(0, res.unselectEditorial.selectedEditorials.length)
      })
    mockFetch(unselectEditorial,  { articleId: articles[1], editionId: editionId2 }, tokens.editor)
      .then(res => {
        t.equal(0, res.unselectEditorial.selectedEditorials.length)
      })
    mockFetch(unselectEditorial,  { articleId: articles[1], editionId: editionId2 }, tokens.reader)
      .then(res => {
        t.false(res.unselectEditorial)
      })
  })
  // PUBLISH EDITION
  test(`Should publish existing edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const publishEdition = `
      mutation($editionId: ID!) {
        publishEdition(editionId: $editionId) {
          id
        }
      }
    `
    mockFetch(publishEdition, { editionId }, tokens.admin)
      .then(res => {
        t.ok(res.publishEdition)
      })
      .catch(err => console.log('ERRR;,', err))
    mockFetch(publishEdition, { editionId: editionId2 }, tokens.editor)
      .then(res => {
        t.ok(res.publishEdition)
      })
    mockFetch(publishEdition, { editionId: editionId2 }, tokens.reader)
      .then(res => {
        t.false(res.publishEdition)
      })
  })
  // UPDATE EDITION
  // test(`Should update existing edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
  //   t.plan(testEmails.length)
  //   const updateEdition = `
  //     mutation($editionId: ID! input: EditionInput!) {
  //       updateEdition(editionId: $editionId) {
  //         id
  //       }
  //     }
  //   `
  //   const variables = {
  //     editionId,
  //     input: {
  //       title: faker.company.catchPhrase(),
  //       key: camelcase(faker.company.catchPhrase()),
  //       body: `<h1>Edição</h1>${faker.lorem.paragraphs()}`,
  //       evaluationPeriod: 60,
  //       publicationPrediction: new Date(Date.now() + 7000000).toISOString(),
  //       contact: faker.phone.phoneNumber(),
  //       startCall: new Date(Date.now() + 60000).toISOString(),
  //       endCall: new Date(Date.now() + 6000000).toISOString(),
  //     }
  //   }
  //   mockFetch(updateEdition, variables, tokens.admin)
  //     .then(res => {
  //       console.log('RES', res)
  //       t.ok(res.updateEdition)
  //     })
  //     .catch(err => console.log('ERRR;,', err))
  //   mockFetch(updateEdition, variables, tokens.editor)
  //     .then(res => {
  //       t.false(res.updateEdition)
  //     })
  //   mockFetch(updateEdition, variables, tokens.reader)
  //     .then(res => {
  //       t.false(res.updateEdition)
  //     })
  // })
  // DELETE EDITION
  // test(`Should delete existing edition if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
  //   t.plan(testEmails.length)
  //   const deleteEdition = `
  //     mutation($editionId: ID!) {
  //       deleteEdition(editionId: $editionId) {
  //         id
  //       }
  //     }
  //   `
  //   mockFetch(deleteEdition, { editionId }, tokens.admin)
  //     .then(res => {
  //       console.log('RES', res)
  //       t.ok(res.deleteEdition)
  //     })
  //     .catch(err => console.log('ERRR;,', err))
  //   mockFetch(deleteEdition, { editionId }, tokens.editor)
  //     .then(res => {
  //       t.false(res.deleteEdition)
  //     })
  //   mockFetch(deleteEdition, { editionId }, tokens.reader)
  //     .then(res => {
  //       t.false(res.deleteEdition)
  //     })
  // })
}