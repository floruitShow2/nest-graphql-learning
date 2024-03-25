import { Resolver, Query, ID, Args, Mutation } from '@nestjs/graphql'
import { Coffee } from './entities/coffee.entity'
import { ParseIntPipe } from '@nestjs/common'
import { CreateCoffeeInput } from './dto/create-coffee.input/create-coffee.input'

@Resolver()
export class CoffeesResolver {
  @Query(() => [Coffee], { name: 'coffees' })
  async findAllCoffees() {
    return []
  }

  @Query(() => Coffee, { name: 'coffee', nullable: true })
  async findCoffeeById(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return null
  }

  @Mutation(() => String, { name: 'createCoffee', nullable: true })
  async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    console.log(createCoffeeInput)
    return 'success ok'
  }
}
