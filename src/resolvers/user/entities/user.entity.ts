import { Field, ID, InputType, OmitType, PartialType, PickType } from '@nestjs/graphql'

@InputType()
export class UserInput {
  @Field(() => ID)
  id: string
  name: string
  password: string
  email: string
}

@InputType()
export class CreateUserInput extends PickType(UserInput, ['name', 'password'] as const) {}

@InputType()
export class ReadUserInput extends OmitType(UserInput, ['password'] as const) {}

@InputType()
export class UpdateUserInput extends PartialType(OmitType(ReadUserInput, ['id'] as const)) {}
