import { Args, Info, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { HumanEntity } from './entities/human.entity'
import { ResultUnion } from './entities/social.entity'

@Resolver(() => HumanEntity)
export class HumanResolver {
  constructor() {}

  @Query(() => HumanEntity, { name: 'characters' })
  async findAllCharacters() {
    return { id: 1, name: 'character', job: 'frontend-developer' }
  }

  @ResolveField(() => [HumanEntity])
  friends(
    // 解析出来的 HumanEntity 对象，friends 字段将会被插入该对象返给客户端
    // Resolved object that implements HumanEntity
    @Parent() character,
    // HumanEntity 类
    // Type of the object that implements HumanEntity
    @Info() { parentType },
    @Args('name', { type: () => String }) name: string
  ) {
    console.log(character, parentType, name)
    return [{ id: 2, name: `test-${name}`, job: 'backend-developer' }]
  }

  @Query(() => [ResultUnion])
  search(): Array<typeof ResultUnion> {
    return [
      {
        id: 1,
        name: 'test aa',
        job: 'developer'
      },
      {
        url: 'https://github.com'
      }
    ]
  }
}
