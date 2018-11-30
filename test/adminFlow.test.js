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
let IssueId
let IssueId2
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
  test(`Should create an unpublished issue if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const createIssue = `
      mutation($input: IssueInput!) {
        createIssue(input: $input) {
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
    mockFetch(createIssue, variables, tokens.admin)
      .then(res => {
        IssueId = res.createIssue.id
        t.ok(res.createIssue)
      })
      .catch(err => console.log('ERRR;,', err))
    mockFetch(createIssue, variables2, tokens.editor)
      .then(res => {
        IssueId2 = res.createIssue.id
        t.ok(res.createIssue)
      })
    mockFetch(createIssue, variables, tokens.reader)
      .then(res => {
        t.false(res.createIssue)
      })
  })
  // PUBLISH EDITION CALL
  test(`Should publish a call for existing issue if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const publishIssueCall = `
      mutation($IssueId: ID!) {
        publishIssueCall(IssueId: $IssueId) {
          id
          publishedCall
        }
      }
    `
    mockFetch(publishIssueCall, { IssueId }, tokens.admin)
      .then(res => {
        console.log('RES', res)
        t.equal(true, res.publishIssueCall.publishedCall)
      })
    mockFetch(publishIssueCall, { IssueId: IssueId2 }, tokens.editor)
      .then(res => {
        console.log('RES2', res)
        t.equal(true, res.publishIssueCall.publishedCall)
      })
    mockFetch(publishIssueCall, { IssueId: IssueId2 }, tokens.reader)
      .then(res => {
        t.false(res.publishIssueCall)
      })
  })
  // SELECT ARTICLES
  test(`Should select articles for issue if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const selectArticles = `
      mutation($articleIds: [ID]! $IssueId: ID!) {
        selectArticles(IssueId: $IssueId articleIds: $articleIds) {
          id
          selectedArticles {
            id
          }
        }
      }
    `
    mockFetch(selectArticles, { articleIds: articles, IssueId }, tokens.admin)
      .then(res => {
        t.deepEqual(articles, res.selectArticles.selectedArticles.map(a => a.id))
      })
    mockFetch(selectArticles,  { articleIds: articles, IssueId: IssueId2 }, tokens.editor)
      .then(res => {
        t.deepEqual(articles, res.selectArticles.selectedArticles.map(a => a.id))
      })
    mockFetch(selectArticles,  { articleIds: articles, IssueId: IssueId2 }, tokens.reader)
      .then(res => {
        t.false(res.selectArticles)
      })
  })
  // UNSELECT ARTICLES
  test(`Should select articles for issue if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const articlesLessOne = articles.filter((a, key) => key !== 0)
    console.log('articlesLessOne', articlesLessOne)
    const unselectArticles = `
      mutation($articleIds: [ID]! $IssueId: ID!) {
        unselectArticles(IssueId: $IssueId articleIds: $articleIds) {
          id
          selectedArticles {
            id
          }
        }
      }
    `
    mockFetch(unselectArticles, { articleIds: articlesLessOne, IssueId }, tokens.admin)
      .then(res => {
        t.equal(1, res.unselectArticles.selectedArticles.length)
      })
    mockFetch(unselectArticles,  { articleIds: articlesLessOne, IssueId: IssueId2 }, tokens.editor)
      .then(res => {
        t.equal(1, res.unselectArticles.selectedArticles.length)
      })
    mockFetch(unselectArticles,  { articleIds: articlesLessOne, IssueId: IssueId2 }, tokens.reader)
      .then(res => {
        t.false(res.unselectArticles)
      })
  })
  // SELECT EDITORIAL
  test(`Should select articles for issue editorial if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const selectEditorial = `
      mutation($articleId: ID! $IssueId: ID!) {
        selectEditorial(IssueId: $IssueId articleId: $articleId) {
          id
          selectedEditorials {
            id
          }
        }
      }
    `
    mockFetch(selectEditorial, { articleId: articles[1], IssueId }, tokens.admin)
      .then(res => {
        t.equal(1, res.selectEditorial.selectedEditorials.length)
      })
    mockFetch(selectEditorial,  { articleId: articles[1], IssueId: IssueId2 }, tokens.editor)
      .then(res => {
        t.equal(1, res.selectEditorial.selectedEditorials.length)
      })
    mockFetch(selectEditorial,  { articleId: articles[1], IssueId: IssueId2 }, tokens.reader)
      .then(res => {
        t.false(res.selectEditorial)
      })
  })
  // UNSELECT EDITORIAL
  test(`Should select articles for issue if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const unselectEditorial = `
      mutation($articleId: ID! $IssueId: ID!) {
        unselectEditorial(IssueId: $IssueId articleId: $articleId) {
          id
          selectedEditorials {
            id
          }
        }
      }
    `
    mockFetch(unselectEditorial, { articleId: articles[1], IssueId }, tokens.admin)
      .then(res => {
        t.equal(0, res.unselectEditorial.selectedEditorials.length)
      })
    mockFetch(unselectEditorial,  { articleId: articles[1], IssueId: IssueId2 }, tokens.editor)
      .then(res => {
        t.equal(0, res.unselectEditorial.selectedEditorials.length)
      })
    mockFetch(unselectEditorial,  { articleId: articles[1], IssueId: IssueId2 }, tokens.reader)
      .then(res => {
        t.false(res.unselectEditorial)
      })
  })
  // PUBLISH EDITION
  test(`Should publish existing issue if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const publishIssue = `
      mutation($IssueId: ID!) {
        publishIssue(IssueId: $IssueId) {
          id
          published
        }
      }
    `
    mockFetch(publishIssue, { IssueId }, tokens.admin)
      .then(res => {
        t.equal(true, res.publishIssue.published)
      })
      .catch(err => console.log('ERRR;,', err))
    mockFetch(publishIssue, { IssueId: IssueId2 }, tokens.editor)
      .then(res => {
        t.equal(true, res.publishIssue.published)
      })
    mockFetch(publishIssue, { IssueId: IssueId2 }, tokens.reader)
      .then(res => {
        t.false(res.publishIssue)
      })
  })
  // UPDATE EDITION
  test(`Should update existing issue if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const updateIssue = `
      mutation($IssueId: ID! $input: IssueUpdateInput!) {
        updateIssue(IssueId: $IssueId input: $input) {
          id
          title
          key
        }
      }
    `
    const variables = {
      IssueId,
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
    mockFetch(updateIssue, variables, tokens.admin)
      .then(res => {
        t.ok(res.updateIssue)
      })
      .catch(err => console.log('ERRR;,', err))
    mockFetch(updateIssue, variables, tokens.editor)
      .then(res => {
        t.ok(res.updateIssue)
      })
    mockFetch(updateIssue, variables, tokens.reader)
      .then(res => {
        t.false(res.updateIssue)
      })
  })
  // DELETE EDITION
  test(`Should delete existing issue if ADMIN or EDITOR and fail if AUTHOR or READER`, (t) => {
    t.plan(testEmails.length)
    const deleteIssue = `
      mutation($IssueId: ID!) {
        deleteIssue(IssueId: $IssueId) {
          id
        }
      }
    `
    mockFetch(deleteIssue, { IssueId }, tokens.admin)
      .then(res => {
        t.ok(res.deleteIssue)
      })
      .catch(err => console.log('ERRR;,', err))
    mockFetch(deleteIssue, { IssueId }, tokens.editor)
      .then(res => {
        t.ok(res.deleteIssue)
      })
    mockFetch(deleteIssue, { IssueId }, tokens.reader)
      .then(res => {
        t.false(res.deleteIssue)
      })
  })
}