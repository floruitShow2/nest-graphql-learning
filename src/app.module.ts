import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoffeesModule } from './coffees/coffees.module'
import { PubsubModule } from './pubsub/pubsub.module'
import { HumanModule } from './human/human.module'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // 在 Apollo Driver 上激活 Subscription 功能
      subscriptions: {
        'graphql-ws': true
      }
    }),
    CoffeesModule,
    PubsubModule,
    HumanModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
