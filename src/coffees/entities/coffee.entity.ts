import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Flavor } from './flavor.entity'

@ObjectType({ description: 'Coffee Model' })
export class Coffee {
  @Field(() => ID, { nullable: true, description: 'A unique identifier' })
  id: number
  name: string
  brand: string
  category: string
  @Field(() => [Flavor], { nullable: 'items' })
  flavors: Flavor[]
}
