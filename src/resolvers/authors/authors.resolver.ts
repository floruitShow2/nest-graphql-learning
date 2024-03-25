import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { Author } from './models/author.model'
import { Post } from './models/post.model'

@Resolver((of) => Author)
export class AuthorsResolver {
  constructor(
    private authorsService: any,
    private postsService: any
  ) {}

  @Query((returns) => Author)
  async author(@Args('id', { type: () => Int }) id: number) {
    return this.authorsService.findOneById(id)
  }

  @ResolveField()
  async posts(@Parent() author: Author) {
    const { id } = author
    return this.postsService.findAll({ authorId: id })
  }

  @Mutation((returns) => Post)
  async upvotePost(@Args({ name: 'postId', type: () => Int }) postId: number) {
    return this.postsService.upvoteById({ id: postId })
  }
}
