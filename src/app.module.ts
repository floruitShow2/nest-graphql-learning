import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { MongooseModule } from '@nestjs/mongoose'
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
      },
      buildSchemaOptions: {
        dateScalarMode: 'timestamp'
      }
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => {
        return { uri: 'mongodb://localhost:27017/meleon' }
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
