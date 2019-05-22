const { Client } = require('pg')

const client = new Client({ connectionString: process.env.DATABASE_URL })
client.connect()

module.exports = client
