import type { GraphQLContext } from '../../../main.ts'

export async function listSales(
  _parent: unknown,
  _args: unknown,
  ctx: GraphQLContext
) {
  return ctx.db.sale.findMany({ include: { products: true } })
}
