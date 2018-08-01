const { GraphQLServer } = require('graphql-yoga')
const mongoose = require('mongoose')
require('dotenv').config()
const resolvers = require('./resolvers')

mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", function(callback){
  console.log("Connection Succeeded")
})

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => req,
})

const options = {
  port: process.env.PORT || 5500,
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
}

server.start(options, ({ port }) => console.log(`Server is running on port ${port}`))
