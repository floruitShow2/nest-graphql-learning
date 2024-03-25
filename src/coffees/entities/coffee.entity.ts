import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'Coffee Model' })
export class Coffee {
  @Field(() => ID, { nullable: true, description: 'A unique identifier' })
  id: number
  name: string
  brand: string
  category: string
  flavors: string[]
}
