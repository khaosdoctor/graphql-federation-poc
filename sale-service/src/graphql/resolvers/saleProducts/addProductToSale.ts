import type { GraphQLContext } from "../../../main.ts"
import type { NonEmptyArray, SaleProductInput } from "../../definitions.ts"

export async function addProductToSale(_parent: undefined, args: { id: number, products: NonEmptyArray<SaleProductInput> }, ctx: GraphQLContext) {
  return ctx.db.$transaction(async (tx) => {
    const productsAlreadyInSale = await tx.saleProducts.findMany({
      where: {
        saleId: args.id,
        AND: {
          productId: { in: args.products.map(p => p.productId) }
        }
      }
    })

    // Insert products that are not already in the sale
    await tx.saleProducts.createMany({
      data: args.products
        .filter(p => !productsAlreadyInSale.some(sp => sp.productId === p.productId))
        .map(p => {
          return {
            saleId: args.id,
            ...p
          }
        })
    })

    // Update the quantity of products that are already in the sale
    await Promise.all(
      productsAlreadyInSale.map(async (p) => {
        return tx.saleProducts.update({
          where: { saleId_productId: { productId: p.productId, saleId: args.id } },
          data: {
            quantity: (p.quantity ?? 1) + (args.products.find(prod => prod.productId === p.productId)?.quantity || 0)
          }
        })
      })
    )

    return tx.sale.findUnique({ where: { id: args.id }, include: { products: true } })
  })
}
