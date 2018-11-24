const fetch = require('node-fetch')
const url = `http://localhost:4000/`

module.exports = async (query, variables, token) => {
  let body
  if (variables) body = JSON.stringify({ query, variables })
  else body = JSON.stringify({ query })
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body
    })
    const json = await res.json()
    return json.data
  } catch (err) {
    throw err
  }
}