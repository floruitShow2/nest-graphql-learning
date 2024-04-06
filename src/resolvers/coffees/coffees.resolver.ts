import {
  Resolver,
  Query,
  ID,
  Args,
  Mutation,
  ResolveField,
  Parent,
  Subscription
} from '@nestjs/graphql'
import { PubSub } from 'graphql-subscriptions'
import { CreateCoffeeInput } from './dto/create-coffee.input'
import { CoffeeEntity } from './entities/coffee.entity'
import { FlavorEntity } from './entities/flavor.entity'
import { CoffeesService } from './coffees.service'
import { UpdateCoffeeInput } from './dto/update-coffee.input'

@Resolver(() => CoffeeEntity)
export class CoffeesResolver {
  constructor(
    private readonly pubsub: PubSub,
    private readonly coffeesService: CoffeesService
  ) {}

  @Query(() => [CoffeeEntity], { name: 'coffees' })
  async findAllCoffees() {
    return this.coffeesService.findAll()
  }

  @Query(() => CoffeeEntity, { name: 'coffee', nullable: true })
  async findCoffeeById(@Args('id', { type: () => ID }) id: string) {
    return this.coffeesService.findOne(id)
  }

  @ResolveField('flavors', () => [FlavorEntity])
  async getFlavors(@Parent() coffee: CoffeeEntity) {
    const { category } = coffee
    console.log(category)
    return this.coffeesService.getFlavorsByCategory(category)
    // return [{ name: 'test flavor', category: 'test category' }]
  }

  @Mutation(() => CoffeeEntity, { name: 'createCoffee', nullable: true })
  async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    return this.coffeesService.create(createCoffeeInput)
  }

  @Mutation(() => CoffeeEntity, { name: 'updateCoffee', nullable: true })
  async update(
    @Args('id') id: string,
    @Args('updateCoffeeInput') updateCoffeeInput: UpdateCoffeeInput
  ) {
    return this.coffeesService.update(id, updateCoffeeInput)
  }

  @Mutation(() => Boolean, { name: 'deleteCoffee', nullable: true })
  async delete(@Args('id') id: string) {
    return this.coffeesService.delete(id)
  }

  @Subscription(() => CoffeeEntity, {
    name: 'coffeeAdded',
    // filter: (payload, variables) => (
    //   payload.coffeeAdded.id === variables.id
    // ),
    resolve(this: CoffeesResolver, value) {
      console.log(this)
      return value
    }
  })
  subscribeToCoffeeAdded(@Args('id') id: number) {
    console.log(id)
    return this.pubsub.asyncIterator('coffeeAdded')
  }
}
