import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { mock } from 'node:test'

const mockUsers = [
  { id: '1', name: 'Alice', age: 30, isMarried: false, email: 'alice@example.com' },
  { id: '2', name: 'Bob', age: 25, isMarried: true, email: 'bob@example.com' },
  { id: '3', name: 'Charlie', age: 35, isMarried: true, email: 'charlie@example.com' }
]

const typeDefs = `
    type Query {
        getUsers: [User]
        getUserById(id: ID!): User
    }

    type Mutation { 
        createUser(name: String!, age: Int!, isMarried: Boolean!): User
    }

    type User {
        id: ID
        name: String
        age: Int
        isMarried: Boolean
        email: String
    }
`

const resolvers = {
  Query: {
    getUsers: () => mockUsers,
    getUserById: (parent, args) => {
      console.log({ parent, args })
      const id = args.id
      return mockUsers.find((user) => user.id === id)
    }
  },
  Mutation: {
    createUser: (parent, args) => {
      const { name, age, isMarried } = args
      const existingUser = mockUsers.find((user) => user.name === name)
      if (existingUser) {
        throw new Error(`User with name ${name} already exists`)
      }
      const newUser = {
        id: (mockUsers.length + 1).toString(),
        name,
        age,
        isMarried,
        email: `${name.toLowerCase()}@example.com`
      }
      mockUsers.push(newUser)
      return newUser
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000
  }
})

console.log(`🚀 Server ready at ${url}`)
