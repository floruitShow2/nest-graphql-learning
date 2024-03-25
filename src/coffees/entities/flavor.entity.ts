import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Flavor {
  @Field(() => ID, { nullable: true, description: 'A unique identifier for flavor' })
  id: number
  name: string
  category: string
}
