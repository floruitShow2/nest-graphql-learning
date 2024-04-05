import { Module } from '@nestjs/common'
import { PubsubModule } from '@/resolvers/pubsub/pubsub.module'
import { LoggerPlugin } from '@/plugins/logger.plugin'
import { CoffeesResolver } from './coffees.resolver'

@Module({
  providers: [CoffeesResolver, LoggerPlugin],
  imports: [PubsubModule]
})
export class CoffeesModule {}
