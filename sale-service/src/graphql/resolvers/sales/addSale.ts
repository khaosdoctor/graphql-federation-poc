import { PaymentStatus } from '../../../generated/prisma/index.js'
import type { GraphQLContext } from '../../../main.ts'
import type { NonEmptyArray, SaleProductInput } from '../../schema.ts'

export async function addSale(
  _parent: undefined,
  args: { customerId: number, products: NonEmptyArray<SaleProductInput> },
  { db }: GraphQLContext
) {

  return db.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        customerId: args.customerId,
      }
    })

    await tx.saleProducts.createMany({
      data: args.products.map((product) => ({
        saleId: sale.id,
        productId: product.productId,
        productType: product.productType,
        quantity: product.quantity,
        priceCent: product.priceCent,
      }))
    })

    return tx.sale.findUnique({ where: { id: sale.id }, include: { products: true } })
  })
}
