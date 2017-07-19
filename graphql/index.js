const express = require('express')
const cors = require('cors')
const graphql = require('express-graphql')
const { makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools')
const typeDefs = require('./schema')
const mocks = require('./mocks')

// global config
const app = express()
const host = 'localhost'
const port = 47274

// make schema
const schema = makeExecutableSchema({
  typeDefs
})

// add mock functions
addMockFunctionsToSchema({
  schema,
  mocks
})

// cors middleware
app.use(cors())

// graphql middleware
app.use('/', graphql({
  graphiql: true,
  schema
}))

// start server
app.listen(port, host, () => {
  console.log(`> Server listening at http://${host}:${port}`)
})
