import { InputType, PickType } from '@nestjs/graphql'
import { CoffeeEntity } from '../entities/coffee.entity'

@InputType()
export class CreateCoffeeInput extends PickType(
  CoffeeEntity,
  ['name', 'brand', 'category'] as const,
  InputType
) {}
