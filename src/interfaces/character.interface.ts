import { Field, ID, InterfaceType } from '@nestjs/graphql'

@InterfaceType()
export abstract class Character {
  @Field(() => ID)
  id: number

  @Field()
  name: string
}
