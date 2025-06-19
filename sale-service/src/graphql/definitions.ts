import { GraphQLScalarType, Kind } from 'graphql'
import { gql } from 'graphql-tag'
import { readFileSync } from 'node:fs'
import { PaymentStatus, type Sale, type SaleProducts } from '../generated/prisma/index.js'
import type { GraphQLContext } from '../main.ts'
import { addProductToSale } from './resolvers/saleProducts/addProductToSale.ts'
import { removeProductFromSale } from './resolvers/saleProducts/removeProductFromSale.ts'
import { addSale } from './resolvers/sales/addSale.ts'
import { findSale } from './resolvers/sales/findSale.ts'
import { listSales } from './resolvers/sales/listSales.ts'
import { updateSale } from './resolvers/sales/updateSale.ts'
import { resolve } from 'node:path'

export type SaleProductInput = Pick<SaleProducts, 'productId' | 'productType' | 'quantity' | 'priceCent'>
export type NonEmptyArray<T> = [T, ...T[]]

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
