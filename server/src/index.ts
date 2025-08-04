import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import e from 'express'
import jwt from 'jsonwebtoken'

interface UserInterface {
  id: string
  name: string
  email: string
  role?: string
}

interface MyContext {
  // we'd define the properties a user should have
  // in a separate user interface (e.g., email, id, url, etc.)
  user: UserInterface
}

const mockUsers = [
  { id: '1', name: 'Alice', age: 30, isMarried: false, email: 'alice@example.com', role: 'admin' },
  { id: '2', name: 'Bob', age: 25, isMarried: true, email: 'bob@example.com', role: 'user' },
  { id: '3', name: 'Charlie', age: 35, isMarried: true, email: 'charlie@example.com', role: 'user' }
]

const typeDefs = `
    type Query {
        getUsers: [User]
        getUserById(id: ID!): User
    }

    type Mutation { 
        createUser(name: String!, age: Int!, isMarried: Boolean!): User
        login(email: String!): AuthPayload!
    }

    type AuthPayload {
      token: String!
      user: User!
    }

    type User {
        id: ID
        name: String
        age: Int
        isMarried: Boolean
        email: String
    }
`

const secretKey = 'your_secret_key'

const resolvers = {
  Query: {
    getUsers: () => mockUsers,
    getUserById: (parent, args, { user }) => {
      if (!user) throw new Error('Not authenticated')
      console.log({ parent, args, user })
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
        email: `${name.toLowerCase()}@example.com`,
        role: 'user'
      }
      mockUsers.push(newUser)
      return newUser
    },
    login: (parent, args) => {
      const { email } = args
      const existingUser = mockUsers.find((user) => user.email === email)
      if (!existingUser) {
        throw new Error(`User with email ${email} not found`)
      }
      const token = jwt.sign({ ...existingUser }, secretKey, {
        expiresIn: '1h' // Token expires in 1 hour
      })
      return { token, user: existingUser }
    }
  }
}

const server = new ApolloServer<MyContext>({ typeDefs, resolvers })

const { url } = await startStandaloneServer(server, {
  listen: {
    port: 4000
  },
  context: async ({ req, res }): Promise<MyContext> => {
    let token = req.headers.authorization || ''
    token = token.replace('Bearer ', '')
    if (token) {
      try {
        const user = jwt.verify(token, secretKey) as UserInterface
        return { user }
      } catch (error) {
        console.error('Invalid token', error)
        return { user: null as any }
      }
    }
    return { user: null as any }
  }
})

console.log(`🚀 Server ready at ${url}`)
