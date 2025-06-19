import type { GraphQLContext } from "../../../main.ts"
import type { NonEmptyArray } from "../../schema.ts"

export async function removeProductFromSale(_parent: undefined, args: { id: number, productIds: NonEmptyArray<number> }, ctx: GraphQLContext) {
  await ctx.db.saleProducts.deleteMany({
    where: {
      saleId: args.id,
      productId: { in: args.productIds }
    }
  })


  return ctx.db.sale.findUnique({ where: { id: args.id }, include: { products: true } })
}
