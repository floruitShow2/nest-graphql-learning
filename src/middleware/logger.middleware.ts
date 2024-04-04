import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql'

export const LoggerMiddleware: FieldMiddleware = async (ctx: MiddlewareContext, next: NextFn) => {
  const value = await next()
  console.log('logger', value)
  return value
}
