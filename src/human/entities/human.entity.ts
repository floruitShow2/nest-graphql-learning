import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Character } from '@/interfaces/character.interface'

@ObjectType({
  implements: () => [Character]
})
export class HumanEntity implements Character {
  @Field(() => ID)
  id: number
  name: string
  job: string
}
