import { Resolver, Query, ID, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql'
import { ParseIntPipe } from '@nestjs/common'
import { CreateCoffeeInput } from './dto/create-coffee.input/create-coffee.input'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'

@Resolver(() => Coffee)
export class CoffeesResolver {
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

  @Mutation(() => String, { name: 'createCoffee', nullable: true })
  async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    console.log(createCoffeeInput)
    return 'success ok'
  }
}
