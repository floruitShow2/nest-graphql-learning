import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
@ObjectType()
export class FlavorEntity {
  @Prop()
  @Field(() => ID, { nullable: true, description: 'A unique identifier for flavor' })
  id: number

  @Prop()
  name: string

  @Prop()
  category: string
}

export const FlavorSchema = SchemaFactory.createForClass(FlavorEntity)
