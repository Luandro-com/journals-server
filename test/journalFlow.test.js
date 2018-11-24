const test = require('tape')
const mockFetch = require('./fetch')
const validator = require('validator')
const faker = require('faker')


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
        cart {
          id
        }
      }
    }`
    mockFetch(user, null, token)
    .then(res => {
      t.equal(true, validator.isEmail(res.user.email))
      t.equal(false, validator.isEmpty(res.user.cart.id))
      t.end()
    })
  })
  // PRODUCTS
  test('should return products and variants', (t) => {
    const products = `{
      products {
        id
        name
        variants {
          id
          name
        }
      }
    }`
    mockFetch(products)
    .then(res => {
      variantsId = res.products[0].variants[0].id
      variantsId2 = res.products[0].variants[1].id
      productId = res.products[0].id
      t.equal(false, validator.isEmpty(res.products[0].name))
      t.equal(false, validator.isEmpty(res.products[0].variants[0].name))
      t.end()
    })
  })
  // ADDTOCART
  test(`should add ${addQuantity} products to the cart and return the cart`, (t) => {
    const addToCart = `
      mutation($input: CartInput!) {
        addToCart(input: $input) {
          products {
            id
            quantity
            product {
              name
            }
            variants {
              name
            }
          }
        }
      }
    `
    const variables = {
      input: {
        productId,
        variantsIds: [variantsId],
        quantity: addQuantity,
      }
    }
    mockFetch(addToCart, variables, token)
    .then(res => {
      // console.log('res', res.addToCart.products[0])
      t.equal(addQuantity, res.addToCart.products[0].quantity)
      t.equal(false, validator.isEmpty(res.addToCart.products[0].id))
      t.end()
    })
  })
  // ADDTOCART VARIANTS
  test(`should add ${addQuantity} products to the cart with ${variantsId2} and return the cart`, (t) => {
    const addToCart = `
      mutation($input: CartInput!) {
        addToCart(input: $input) {
          products {
            id
            quantity
            product {
              name
            }
            variants {
              name
            }
          }
        }
      }
    `
    const variables = {
      input: {
        productId,
        variantsIds: [
          variantsId,
          variantsId,
          variantsId,
          variantsId,
          variantsId,
          variantsId,
          variantsId2,
          variantsId2,
          variantsId2,
          variantsId2,
          variantsId2,
          variantsId2,
        ],
        quantity: addQuantity,
      }
    }
    mockFetch(addToCart, variables, token)
    .then(res => {
      t.equal(addQuantity, res.addToCart.products[1].quantity)
      t.equal(false, validator.isEmpty(res.addToCart.products[1].id))
      t.end()
    })
  })
  // REMOVEFROMCART
  test(`should remove ${removeQuantity} products from the cart and return the cart`, (t) => {
    const removeFromCart = `
      mutation($input: CartInput!) {
        removeFromCart(input: $input) {
          products {
            id
            quantity
            product {
              name
            }
            variants {
              name
            }
          }
        }
      }
    `
    const variables = {
      input: {
        productId,
        variantsIds: [variantsId],
        quantity: removeQuantity,
      }
    }
    mockFetch(removeFromCart, variables, token)
    .then(res => {
      cartId = res.removeFromCart.products[0].id
      t.equal((addQuantity - removeQuantity), res.removeFromCart.products[0].quantity)
      t.equal(false, validator.isEmpty(res.removeFromCart.products[0].id))
      t.end()
    })
  })
  // DELETECARTITEM
  test(`should remove ${removeQuantity} products from the cart thus deleting it and return the cart`, (t) => {
    const removeFromCart = `
      mutation($input: CartInput!) {
        removeFromCart(input: $input) {
          products {
            cart {
              id
            }
            id
            quantity
            product {
              name
            }
            variants {
              name
            }
          }
        }
      }
    `
    const variables = {
      input: {
        productId,
        variantsIds: [variantsId],
        quantity: removeQuantity,
      }
    }
    mockFetch(removeFromCart, variables, token)
    .then(res => {
      cartId2 = res.removeFromCart.products[0].cart.id
      t.equal(true, (res.removeFromCart.products.length === 1))
      t.end()
    })
  })
  // SAVEADDRESS
  test(`should save and return address`, (t) => {
    const saveAddress = `
      mutation($input: AddressInput!) {
        saveAddress(input: $input) {
          id
          zip
        }
      }
    `
    const variables = {
      input: {
        street: faker.address.streetAddress(),
        number: faker.random.number().toString(),
        complement: faker.address.secondaryAddress(),
        zip: faker.address.zipCode(),
        district: faker.address.county(),
        city: faker.address.city(),
        state: faker.address.state(),
        country: faker.address.country(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      }
    }
    mockFetch(saveAddress, variables, token)
    .then(res => addressId2 = res.saveAddress.id)
    mockFetch(saveAddress, variables, token)
    .then(res => {
      firstZip = res.saveAddress.zip
      addressId = res.saveAddress.id
      t.equal(true, (res.saveAddress.id !== null))
      t.end()
    })
    .catch(err => console.log(err))
  })
  // UPDATEADDRESS
  test(`should update and return a different address`, (t) => {
    console.log('addressId', addressId)
    const updateAddress = `
      mutation($input: AddressInput!) {
        saveAddress(input: $input) {
          id
          zip
        }
      }
    `
    const variables = {
      input: {
        street: faker.address.streetAddress(),
        number: faker.random.number().toString(),
        complement: faker.address.secondaryAddress(),
        zip: faker.address.zipCode(),
        district: faker.address.county(),
        city: faker.address.city(),
        state: faker.address.state(),
        country: faker.address.country(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        addressId,
      }
    }
    mockFetch(updateAddress, variables, token)
    .then(res => {
      t.equal(true, (firstZip !== res.saveAddress.zip))
      t.end()
    })
  })
  // REMOVEADDRESS
  test(`should remove the address and return user addresses`, (t) => {
    const removeAddress = `
      mutation($addressId: ID!) {
        removeAddress(addressId: $addressId) {
          id
        }
      }
    `
    const variables = {
      addressId
    }
    mockFetch(removeAddress, variables, token)
    .then(res => {
      console.log('RES', res)
      t.equal(true, (res.removeAddress.length === 1))
      t.end()
    })
  })
  // SAVEORDER
  test(`should create and return a new order`, (t) => {
    console.log('cartId2', cartId2)
    const saveOrder = `
      mutation($input: OrderInput!) {
        saveOrder(input: $input) {
          id
        }
      }
    `
    const variables = {
      input: {
        cartId: cartId2,
        shippingAddressId: addressId2,
      }
    }
    mockFetch(saveOrder, variables, token)
    .then(res => {
      console.log('RES', res)
      orderId = res.saveOrder.id
      t.equal(true, (res.saveOrder.id !== null))
      t.end()
    })
    .catch(err => console.log(err))
  })
  // CANCELORDER
  test(`should cancel order ${orderId} and return user orders`, (t) => {
    console.log('orderId', orderId)
    const cancelOrder = `
      mutation($orderId: ID!) {
        cancelOrder(orderId: $orderId) {
          id
          status
        }
      }
    `
    const variables = {
      orderId: orderId
    }
    mockFetch(cancelOrder, variables, token)
    .then(res => {
      console.log('RES', res)
      t.equal(true, (res.cancelOrder[0].status === 'CANCELED'))
      t.end()
    })
    .catch(err => console.log(err))
  })
  // PAYMENT
  test(`should start payment for order ${orderId} and return payment`, (t) => {
    console.log('orderId', orderId)
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
        orderId: orderId
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