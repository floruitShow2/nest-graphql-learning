import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class CreateCoffeeInput {
  @Field(() => String, { description: 'A new coffee name' })
  name: string
  brand: string
  category: string
  flavors: string[]
}
