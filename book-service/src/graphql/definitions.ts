import { GraphQLScalarType, Kind } from 'graphql'
import { listBooks } from './resolvers/books/listBooks.ts'
import { findBook } from './resolvers/books/findBook.ts'
import { removeBook } from './resolvers/books/deleteBook.ts'
import { updateBook } from './resolvers/books/updateBook.ts'
import { findAuthor } from './resolvers/author/findAuthor.ts'
import { listAuthors } from './resolvers/author/listAuthors.ts'
import { removeAuthor } from './resolvers/author/deleteAuthor.ts'
import { updateAuthor } from './resolvers/author/updateAuthor.ts'
import { addBook } from './resolvers/books/addBook.ts'
import { addAuthor } from './resolvers/author/addAuthor.ts'
import type { Author, Book } from '../generated/prisma/index.js'
import type { GraphQLContext } from '../main.ts'
import { gql } from 'graphql-tag'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const schema = gql(readFileSync(resolve(import.meta.dirname, './schema.graphql'), { encoding: 'utf8' }))

export const resolvers = {
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A date and time in ISO 8601 format',
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value)
      }
      return null
    },
    serialize(value) {
      if (value instanceof Date) {
        return value.toISOString()
      }
      throw new Error(`Value is not a Date: ${value}`)
    },
    parseValue(value) {
      const date = new Date(value as string)
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${value}`)
      }
      return date
    },
  }),
  Void: new GraphQLScalarType({
    name: 'Void',
    description: 'A type that represents no value',
    parseLiteral() {
      return null
    },
    parseValue() {
      return null
    },
    serialize() {
      return null
    },
  }),
  Book: {
    __resolveReference: (resolvedBook: { id: number }, ctx: GraphQLContext) => {
      return ctx.db.book.findUnique({ where: { id: resolvedBook.id } })
    },
    authors: async (parent: Book, _args: undefined, ctx: GraphQLContext) => {
      const result = await ctx.db.authorsBooks.findMany({
        where: {
          bookId: parent.id,
        },
        include: { author: true },
      })

      return result.map((item) => item.author)
    },
    sales: async (parent: Book) => {
      return { id: parent.id }
    }
  },
  Author: {
    // Field resolvers for the books field in Author type so the schema knows how to resolve it
    // and fetch the related books for an author
    books: async (parent: Author, _args: undefined, ctx: GraphQLContext) => {
      // We could fetch directly from author table and then include the books
      // however this includes only the NxM relation and not the actual book details
      const result = await ctx.db.authorsBooks.findMany({
        where: {
          authorId: parent.id,
        },
        include: { book: true },
      })

      // Doing that above would need us to fetch all the books from the database
      // manually
      return result.map((item) => item.book)
    },
  },
  Query: {
    books: listBooks,
    book: findBook,
    author: findAuthor,
    authors: listAuthors,
  },
  Mutation: {
    addBook,
    removeBook,
    updateBook,
    addAuthor,
    removeAuthor,
    updateAuthor,
  },
}
