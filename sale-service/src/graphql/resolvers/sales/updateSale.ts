import type { Sale } from '../../../generated/prisma/index.js'
import type { GraphQLContext } from '../../../main.ts'

export async function updateSale(
  id: Sale['id'],
  updateData: Partial<Sale>,
  { db }: GraphQLContext
) {
  return db.sale.update({
    where: { id }, data: updateData
  })
}
