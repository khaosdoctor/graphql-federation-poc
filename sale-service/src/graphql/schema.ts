import { GraphQLScalarType, Kind } from 'graphql'
import type { GraphQLContext } from '../main.ts'
import { listSales } from './resolvers/sales/listSales.ts'
import { findSale } from './resolvers/sales/findSale.ts'
import { PaymentStatus, type Sale, type SaleProducts } from '../generated/prisma/index.js'
import { addSale } from './resolvers/sales/addSale.ts'
import { updateSale } from './resolvers/sales/updateSale.ts'
import { addProductToSale } from './resolvers/saleProducts/addProductToSale.ts'
import { removeProductFromSale } from './resolvers/saleProducts/removeProductFromSale.ts'

export type SaleProductInput = Pick<SaleProducts, 'productId' | 'productType' | 'quantity' | 'priceCent'>
export type NonEmptyArray<T> = [T, ...T[]]

export const schema = `#graphql
scalar DateTime
scalar Void

enum PaymentStatus {
  PENDING
  COMPLETED
  CANCELLED
}

type Sale {
  id: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  customerId: Int!
  status: PaymentStatus!
  products: [SaleProduct!]!
}

type SaleProduct {
  createdAt: DateTime!
  updatedAt: DateTime!
  productId: Int!
  productType: String!
  quantity: Int!
  priceCent: Int!
}

input SaleProductInput {
  productId: Int!
  productType: String = "BOOK"
  quantity: Int = 1
  priceCent: Int!
}

type Query {
  sales: [Sale]!
  sale(id: Int!): Sale
}

type Mutation {
  newSale(customerId: Int!, products: [SaleProductInput!]!): Sale!
  completeSale(id: Int!): Sale!
  cancelSale(id: Int!): Void!
  addProductToSale(id: Int!, products: [SaleProductInput!]!): Sale!
  removeProductFromSale(id: Int!, productIds: [Int]!): Sale!
}

schema {
    mutation: Mutation
    query: Query
}
`

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
  Sale: {
    products: (sale: Sale, _args: undefined, ctx: GraphQLContext) => {
      return ctx.db.saleProducts.findMany({ where: { saleId: sale.id } })
    }
  },
  Query: {
    sales: listSales,
    sale: findSale
  },
  Mutation: {
    cancelSale: (_parent: undefined, args: { id: number }, ctx: GraphQLContext) => {
      return updateSale(args.id, { status: PaymentStatus.CANCELED }, ctx)
    },
    completeSale: (_parent: undefined, args: { id: number }, ctx: GraphQLContext) => {
      return updateSale(args.id, { status: PaymentStatus.COMPLETED }, ctx)
    },
    newSale: addSale,
    addProductToSale,
    removeProductFromSale
  }
}
