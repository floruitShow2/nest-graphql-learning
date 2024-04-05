import { Field, ObjectType, createUnionType } from '@nestjs/graphql'
import { LoggerMiddleware } from '@/middlewares/logger.middleware'
import { UpperMiddleware } from '@/middlewares/upper.middleware'
import { HumanEntity } from './human.entity'

@ObjectType()
export class SocialEntity {
  @Field({ middleware: [LoggerMiddleware, UpperMiddleware] })
  url: string
}

export const ResultUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [HumanEntity, SocialEntity] as const,
  resolveType: (value) => {
    if (value.url) return SocialEntity
    if (value.id) return HumanEntity
    return null
  }
})
