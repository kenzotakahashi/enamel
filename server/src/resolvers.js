const { GraphQLScalarType } = require('graphql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const { User } = require('./models')

const resolvers = {
  Query: {
		test (_, args, context) {
			return 'Hello World!!'
		}
  },
  Mutation: {
    async captureEmail (_, {email}) {
      const isEmailTaken = await User.findOne({email})
      if (isEmailTaken) {
        throw new Error('This email is already taken')
      }
      const user = await User.create({
        email,
        role: 'Owner',
        status: 'Pending'
      })
      return user
    },
    async signup (_, {id, firstname, lastname, password}) {
    },
    async login (_, {email, password}) {
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value) => moment(value).toDate(), // value from the client
    serialize: (value) => value.getTime(), // value sent to the client
    parseLiteral: (ast) => ast
  })
}

module.exports = resolvers