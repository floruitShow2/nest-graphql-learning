import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PubsubModule } from '@/resolvers/pubsub/pubsub.module'
import { LoggerPlugin } from '@/plugins/logger.plugin'
// import { DateScalar } from '@/scalars/date.scalar';
import { CoffeesResolver } from './coffees.resolver'
import { CoffeesService } from './coffees.service'
import { CoffeeEntity, CoffeeSchema } from './entities/coffee.entity'
import { FlavorEntity, FlavorSchema } from './entities/flavor.entity'

@Module({
  providers: [
    CoffeesResolver,
    LoggerPlugin,
    CoffeesService
    // DateScalar
  ],
  imports: [
    MongooseModule.forFeature([
      { name: CoffeeEntity.name, schema: CoffeeSchema, collection: 'coffees' },
      { name: FlavorEntity.name, schema: FlavorSchema, collection: 'flavors' }
    ]),
    PubsubModule
  ]
})
export class CoffeesModule {}
