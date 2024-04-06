import { Injectable } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { CreateCoffeeInput } from './dto/create-coffee.input'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CoffeeEntity } from './entities/coffee.entity'
import { UpdateCoffeeInput } from './dto/update-coffee.input'
import { FlavorEntity } from './entities/flavor.entity'

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(CoffeeEntity.name) private readonly coffeeModel: Model<CoffeeEntity>,
    @InjectModel(FlavorEntity.name) private readonly flavorModel: Model<FlavorEntity>,
    private readonly pubsub: PubSub
  ) {}

  async findAll() {
    return await this.coffeeModel.find()
  }

  async findOne(id: string) {
    return await this.coffeeModel.findOne({ _id: id })
  }

  async create(createCoffeeInput: CreateCoffeeInput) {
    const res = await this.coffeeModel.create({ ...createCoffeeInput, createAt: new Date() })
    const savedCoffee = await res.save()

    savedCoffee.id = savedCoffee._id.toString()
    this.pubsub.publish('coffeeAdded', { coffeeAdded: savedCoffee })
    return savedCoffee
  }

  async update(id: string, updateCoffeeInput: UpdateCoffeeInput) {
    const res = await this.coffeeModel.updateOne(
      {
        _id: id
      },
      {
        $set: updateCoffeeInput
      }
    )
    const { matchedCount, modifiedCount } = res
    if (matchedCount >= 1 && modifiedCount === 1) {
      const res = await this.findOne(id)
      res.id = res._id.toString()
      return res
    } else {
      return null
    }
  }

  async delete(id: string) {
    const res = await this.coffeeModel.deleteOne({ _id: id })
    if (res.deletedCount > 0) return true
    else return false
  }

  async getFlavorsByCategory(category: string) {
    const res = await this.flavorModel.find({ category })
    return res || []
  }
}
