import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Document } from 'mongoose'
import { MinLength } from 'class-validator'
import { FlavorEntity } from './flavor.entity'

@Schema()
@ObjectType({ description: 'Coffee Model' })
export class CoffeeEntity extends Document {
  @Prop()
  @Field(() => ID, { nullable: false, description: 'A unique identifier' })
  id: string

  @Prop()
  @MinLength(3)
  name: string

  @Prop()
  brand: string

  @Prop()
  category: string

  @Prop()
  @Field(() => [FlavorEntity], { nullable: 'items' })
  flavors?: FlavorEntity[]

  @Prop()
  @Field()
  createAt?: Date
}

export const CoffeeSchema = SchemaFactory.createForClass(CoffeeEntity)
