import type { GraphQLContext } from '../../../main.ts'
import { NotFoundError } from '../../errors/NotFound.ts'

export async function findSale(
  _parent: undefined,
  args: { id: number },
  ctx: GraphQLContext
) {
  const purchase = await ctx.db.sale.findFirst({
    where: { id: args.id },
    include: { products: true },
  })

  if (!purchase) throw new NotFoundError('Purchase', args.id)
  return purchase
}
