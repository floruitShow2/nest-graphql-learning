import { Module } from '@nestjs/common'
import { PubsubModule } from '@/pubsub/pubsub.module'
import { CoffeesResolver } from './coffees.resolver'

@Module({
  providers: [CoffeesResolver],
  imports: [PubsubModule]
})
export class CoffeesModule {}
