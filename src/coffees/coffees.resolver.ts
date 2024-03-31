import { Resolver, Query, ID, Args, Mutation, ResolveField, Parent, Subscription } from '@nestjs/graphql'
import { ParseIntPipe } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { CreateCoffeeInput } from './dto/create-coffee.input/create-coffee.input'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'

@Resolver(() => Coffee)
export class CoffeesResolver {

  constructor(private readonly pubsub: PubSub) {}

  @Query(() => [Coffee], { name: 'coffees' })
  async findAllCoffees() {
    return []
  }

  @Query(() => Coffee, { name: 'coffee', nullable: true })
  async findCoffeeById(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return null
  }

  @ResolveField('flavors', () => [Flavor])
  async getFlavors(@Parent() coffee: Coffee) {
    const { category } = coffee
    console.log(category)
    // return this.flavorService.findAllFlavors({ category })
    return [{ name: 'test flavor', category: 'test category' }]
  }

  @Mutation(() => Coffee, { name: 'createCoffee', nullable: true })
  async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    const newCoffee = {
      ...createCoffeeInput,
      id: +(Math.random() * 10).toFixed(0),
      flavors: [],
      aaa: 1
    }
    console.log('new coffee', newCoffee)
    this.pubsub.publish('coffeeAdded', { coffeeAdded: newCoffee })
    return newCoffee
  }

  @Subscription(
    (returns) => Coffee,
    {
      name: 'coffeeAdded',
      // filter: (payload, variables) => (
      //   payload.coffeeAdded.id === variables.id
      // ),
      resolve(this: CoffeesResolver, value) {
        console.log(this)
        return value
      }
    }
  )
  subscribeToCoffeeAdded(@Args('id') id: number) {
    return this.pubsub.asyncIterator('coffeeAdded')
  }
}
