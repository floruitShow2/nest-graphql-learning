import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoffeesModule, HumanModule, PubsubModule, UserModule } from './resolvers'

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
    HumanModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
