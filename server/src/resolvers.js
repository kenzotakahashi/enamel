const resolvers = {
	Query: {
		test (_, args, context) {
			return 'Hello World!!'
		}
	}
}

module.exports = resolvers