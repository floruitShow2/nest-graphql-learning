import { ApolloServerPlugin, BaseContext, GraphQLRequestListener } from '@apollo/server'
import { Plugin } from '@nestjs/apollo'

@Plugin()
export class LoggerPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<void | GraphQLRequestListener<BaseContext>> {
    console.log('logger.plugin: ', 'request started')
    return {
      async willSendResponse() {
        console.log('will send response')
      }
    }
  }
}
