## 一、Intro

**GraphQL** 是一种强大的 API 查询语言和运行时，用于实现使用现有数据的查询。

它提供了一种优雅的方法，可以解决通常在 REST API 中发现的许多问题，同时与 **TypeScript** 相结合，可以帮助我们编写的 GraphQL 查询拥有更好的类型安全，从而实现端到端的类型化。

学习之前，作为背景知识，可以了解下 GraphQL 和 REST 之间的**区别**。

本文会重点介绍如何使用内置的 `@nestjs/graphql` 模块。

`GraphQLModule` 可以配置为使用 **Apollo** 服务器(使用 `@nestjs/apollo` 驱动程序)和 **Mercurius**(使用 `@nestjs/mercurius`)。Nestjs 为这些经过验证的 GraphQL 软件包提供了官方集成，以提供一种简单的方式在 Nest 中使用 GraphQL。



[源码]: https://github.com/floruitShow2/nest-graphql-learning



## 二、Quick Start

### （一）介绍

Nest提供了两种构建 GraphQL 应用程序的方式：**代码优先**和**模式优先**。在 Nestjs 官方文档中，大多数 GraphQL 相关章节都分为这两个部分吗，你可以选择你更偏爱的方式。

在**代码优先**方法中，需要使用 `装饰器` 和 `TypeScript Class` 来生成相应的 GraphQL Schema。如果你倾向于只使用 TypeScript，避免在不同语言语法之间切换上下文，这种方法就很有用。

在**模式优先**方法中，主要使用 GraphQL SDL(Schema Definition Language：模式定义语言)文件，这种文件并非使用特定的编程语言编写，因此可在不同平台之间共享模式文件。Nest会根据 GraphQL Schema 自动生成TypeScript 类型定义(使用类或接口)，从而减少编写冗余的样板代码的需要。

### （二）安装

```bash
# For Express and Apollo
npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql --save
```

### （三）基础示例

当上面提到的第三方全部安装好后，可以从 `@nestjs/graphql` 中导入 `GraphQLModule` 并使用 `forRoot` 静态方法传入配置选项。

```ts
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql')
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

`forRoot` 方法会接收一个对象作为参数，并将该对象传递至底层驱动实例（Apollo 或 mercurius）。示例代码中用的 `@nestjs/apollo` ，上述代码的配置项会被传递至 ApolloServer 构造函数。

如果在这一步尝试运行项目代码，会出现以下报错，无需担心。

这个错误是因为在 GraphQL 服务器中尚未定义任何查询。GraphQL 规定，每个服务器必须至少有一个 @Query() 才能被认为是有效的 GraphQL 服务器。如果没有定义任何查询，Apollo 服务器将会抛出异常，无法正常启动。

![image-20240323171139510](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240323171139510.png)

### （四）运行平台

GraphQL playground 是一个图形化、交互式、基于浏览器的 GraphQL IDE，默认情况下它与 GraphQL 服务器本身的URL是相同的。

要访问运行平台，首先需要配置并运行基本的 GraphQL 服务器，要立即查看它,您可以安装并构建**此处的工作示例**。或者,如果您正在按照这些代码示例进行操作,一旦完成**Resolvers章节**中的步骤后,您就可以访问playground。

准备就绪后,并在后台运行您的应用程序,然后您可以打开Web浏览器并导航到`http://localhost:3000/graphql`(主机和端口可能因您的配置而有所不同)。然后您将看到如下所示的GraphQL playground。

![image-20240324163054031](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240324163054031.png)

### （五）多端点

默认情况下，GraphQL 会搜索整个应用的解析器，可以使用 include 属性来限制扫描行为，仅涉及到其中一部分模块。

```ts
GraphQLModule.forRoot({
  include: [CoffeesModule],
})
```

### （六）Code First

> 在**Code First**方法中，需要使用 TypeScript 的 `装饰器` 和 `Class` 来生成相应的 GraphQL Schema

首先，我们需要为 GraphQLModule 的配置项提供 autoSchemaFile 属性

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
})
```

该属性值是自动生成的 Schema 文件的存储路径。或者，也可以设置 `autoSchemaFile: true` 在内存中动态生成 Schema

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true,
})
```

默认情况下，生成的 Schema 中的类型会按照他们在模块中定义的顺序排列，如果希望它们按照词典顺序排列，可以设置 `sortSchema: true`

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,
})
```

## 三、Resolvers

Resolvers 提供了将 GraphQL 操作【query / mutation / subscription】转换为数据的指令，通过 `同步` 或 `Promise` 的方式返回与我们在 Schema 中定义的结构相同的数据。

通常，我们需要手动创建 Resolvers 映射表，另一方面，`@nestjs/graphql` 会使用我们提供给装饰器的元数据自动生成映射。

为了演示使用该库创建 GraphQL API 的过程,我们将创建一个简单的 `coffees API`。

### （一）Object Types

大多数在 GraphQL Schema 文件中的定义都是 Object Types。每个我们定义的 Object Types 都应该代表一个域对象提供给客户端与之进行交互。例如，示例的 `coffees API` 需要能够获取咖啡及其风味，因此，我们应该分别定义 Coffee 和 Flavor 类型来实现此功能。

首先，在终端创建 coffees.entity 文件

```shell
nest g class coffees/entities/coffee.entity --no-spec

nest g class coffees/entities/flavor.entity --no-spec
```

首先，在终端创建 coffees.module 和 coffees.resolver 文件

```shell
# 创建 coffees.module.ts 文件
nest g mo coffees
# 创建 coffees.resolver.ts 文件
nest g resolver coffees
```

以下是我们使用 Typescript 类和装饰器实现的 Coffee Object Types：

```ts
// resolvers/coffees/entities/coffee.entity.ts
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Flavor } from './flavor.entity'

@ObjectType({ description: 'Coffee Model' })
export class Coffee {
  @Field(() => ID, { nullable: true, description: 'A unique identifier' })
  id: number
  name: string
  brand: string
  category: string
  @Field(() => [Flavor], { nullable: 'items' })
  flavors: Flavor[]
}
```

我们可以借助 nestjs 提供的插件机制，`@nestjs/graphql`可以帮助我们自行推断 Object Types 中属性的类型，并在生成的 SDL 中标注上对应的 GraphQL Types，从而省去我们编写大量模板代码的时间。

```json
{
	"compilerOptions": {
    	"plugins": ["@nestjs/graphql"]
  	}
}
```

> 但是 Typescript 的元数据反射系统会有一系列限制，比如，判断某个类是由哪些属性组成，或者判断某个属性是可选的还是必须的。
>
> 因此，我们需要使用 @Field 装饰器明确指出每个属性的 GraphQL 类型和是否可选等。

GraphQL 暴露出来的类型可以是标量类型，比如 ID、String、Boolean、Int，也可以是另一个 Object Type。



@Field 装饰器可以接收两个参数：**类型函数**（() => ID）以及 **配置对象**。

**类型函数**：当 Typescript 类型系统和 GraphQL 类型系统间存在潜在歧义的时候，类型函数就是必需的。具体来说，对于 String 和 Boolean 类型，使不使用类型函数无关紧要，但是对于 Number 类型，由于 GraphQL 类型系统中区分了 Int 和 Float，此时就需要明确指出返回的是 Int 还是 Float.

**配置对象**：支持下列键值对

- `nullable`：boolean 类型，指明字段是否可为 null (在 SDL中，每个字段默认都是非空的)
- `description`：string 类型，对字段的描述
- `deprecationReason`：string 类型，将字段标记为弃用

```ts
@Field({
    nullable: false,
    description: 'A unique identifier',
    deprecationReason: 'Not useful in v2 schema'
})
id: number
```

如果字段类型是数组，则必须手动指明该数组的类型

```ts
@Field(type => [Flavor])
flavors: Flavor[]
```

也可以用 `[[ Int ]]` 写法表示整数矩阵

如果想表示数组内的元素不能为空，可以设置 `nullable: 'items'`

```ts
@Field(type => [Flavor], { nullable: 'items' })
flavors: Flavor[]
```

> 表示数组本身及其内部元素都不为空，使用 `nullable: 'itemsAndList'`

```ts
// resolvers/coffees/entities/flavor.entity.ts
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Flavor {
    @Field(() => ID, { nullable: false, description: 'A unique identifier for flavor' })
    id: number
    name: string
    category: string
}
```

### （二）Code First Resolver

截至目前，我们已经分别定义好了 Coffee 和 Flavor 类型定义，但是应用还不同和这些类型进行交互，为了解决这个问题，我们需要创建一个解析器类，在 Code First 中，解析器可以定义解析器函数并生成查询类型。

```ts
// resolvers/coffees/coffees.resolver.ts
import { Resolver, Query, ID, Args, Mutation, ResolveField, Parent } from '@nestjs/graphql'
import { ParseIntPipe } from '@nestjs/common'
import { CreateCoffeeInput } from './dto/create-coffee.input/create-coffee.input'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'

@Resolver(() => Coffee)
export class CoffeesResolver {
  @Query(() => [Coffee], { name: 'coffees' })
  async findAllCoffees() {
    return []
  }

  @Query(() => Coffee, { name: 'coffee', nullable: true })
  async findCoffeeById(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return null
  }

  @ResolveField('flavors', () => [Flavor])
  async getFlavors(@Parent() coffee: Coffee) {
    const { category } = coffee
    console.log(category)
    // return this.flavorService.findAllFlavors({ category })
    return [{ name: 'test flavor', category: 'test category' }]
  }

  @Mutation(() => String, { name: 'createCoffee', nullable: true })
  async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    console.log(createCoffeeInput)
    return 'success ok'
  }
}
```

上面的示例代码中，我们创建了 CoffeesResolver 类，并使用 @Resolver 装饰器标注。

传递给 @Resolver 的参数是可选的，通常是提供一个父对象 `@Resolver(of => Coffee)`

此时，Field 解析器中可以使用 `@Parent()` 方法参数装饰器来提取对该父对象的引用，并在遍历对象图时使用到该父对象。

CoffeesResolver 类中包含一个**Field 解析器**函数【处理`Coffee` 对象类型的 `flavors` 属性】，从示例中可以明显看出，该函数需要访问 `Coffee` 对象，通过调用一个以 `coffee.category` 为参数的服务，将返回值填充至 `coffee.flavors` 数组中。

因此，我们需要在 `@Resolver()` 装饰器中提供一个值，以指示在当前 类 中定义的所有字段解析器的父类型【即 Coffee】。

我们可以在该类和任何其他解析器类中定义多个 `@Query()` 解析器函数，它们将在生成的 SDL 中聚合成**单个**查询类型定义和解析器映射表中的相应条目。

因此，为了让我们编写的代码更有条理性，可以把 **Query 解析器函数 ** 和它们所使用的**模型**和**服务**放在一起。

### （三）Query Type Name

在示例代码中，@Query 装饰器在默认情况下会基于**方法名**生成相同的 GraphQL Schema 查询类型名称。

```ts
@Query(() => Coffee, { nullable: true })
async coffee(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
	return null
}
```

```graphql
// 生成的 schema.gql
type Query {
  coffee(id: ID!): Coffee
}
```

但就惯例来说，多是手动设置查询类型名称，让方法名和类型名相解耦。

比如，下面的代码中我们将方法名设置为 findCoffeeById，并在 @Query 中手动传递 `name: 'coffee'` 来设置类型名

```ts
@Query(() => Coffee, { name: 'coffee', nullable: true })
async findCoffeeById(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return null
}
```

同理，Field 解析器也可以手动设置类型名

```ts
@ResolveField('flavors', () => [Flavor])
async getFlavors(@Parent() coffee: Coffee) {
    const { category } = coffee
    console.log(category)
    // 尚未对接数据库，暂不使用 flavorService 获取数据
    // return this.flavorService.findAllFlavors({ category })
    return [{ name: 'test flavor', category: 'test category' }]
}
```

除了 name 属性，还有下列属性可以设置：

- `name`： string 类型，query 的名称
- `description`：string 类型，会在 GraphQL Schema 文档中用到的描述信息
- `deprecationReason`：string 类型，设置 query 是否为已废弃
- `nullable`：boolean | 'items' | 'itemsAndList'。query 能否返回一个空响应

### （四）@Args() 装饰器配置项

@Args() 主要用于从请求中提取出解析器函数需要的参数，和 @Get()、@Post 等装饰器功能非常相似。

通常，我们并不需要为 @Args() 添加第二个配置项参数，比如，如果参数的类型是 string 的话，那么简单的 `@Args('id') id: string` 就已经能够帮我们从 GraphQL 请求中提取出 id 字段了。

同理，当参数类型为 number 时，我们就需要手动设置返回值类型是 Int 还是 Float：

```typescript
@Query(() => Coffee, { name: 'coffee', nullable: true })
async findCoffeeById(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return null
}
```

以下是可以配置的属性值：

- `type`：返回 **GraphQL 类型** 的函数
- `defaultValue`：any 类型，默认值
- `description`：string 类型，描述信息
- `deprecationReason`：string 类型，禁用某个参数并说明原因
- `nullable`：boolean | 'items' | 'itemsAndList' 某个字段是否可为 null

Query 解析器函数可以接收多个参数，比如，我们希望根据 brand 和 category 查询 coffees：

```ts
getCoffees(
  @Args('brand', { nullable: true }) brand?: string,
  @Args('category', { defaultValue: '' }) category?: string,
) {}
```

但是，当我们的参数变得复杂，上面的多次使用 @Args() 装饰器的写法就显得有些臃肿。为了让代码更简洁明了，我们可以事先创建一个专用的参数类提供给 @Args()

```ts
@Args() args: GetCoffeeArgs

import { MinLength } from 'class-validator';
import { Field, ArgsType } from '@nestjs/graphql';

@ArgsType()
class GetCoffeeArgs {
  @Field({ nullable: true })
  brand?: string;

  @Field({ defaultValue: '' })
  @MinLength(5)
  category: string;
}
```

### （五）Class Inheritance

我们可以通过继承的方法，将多个类的通用类型抽离出来。例如，我们的应用中涉及多个分页查询功能，它们的参数总归是包含基础的 standard 和 limit 字段，以及其他特定的索引字段。

我们可以按照下面的示例编写代码：

```ts
// Base Type
@ArgsType()
class PaginationArgs {
  @Field((type) => Int)
  offset: number = 0;

  @Field((type) => Int)
  limit: number = 10;
}
```

```typescript
// Specific Type
@ArgsType()
class GetAuthorArgs extends PaginationArgs {
  @Field({ nullable: true })
  brand?: string;

  @Field({ defaultValue: '' })
  @MinLength(5)
  category: string;
}
```

该方法也适用于 @ObjectType() 类型定义中：

```ts
// Base Type
@ObjectType()
class Character {
  @Field((type) => Int)
  id: number;

  @Field()
  name: string;
}
```

```ts
// Specific Type
@ObjectType()
class Warrior extends Character {
  @Field()
  level: number;
}
```

同理，我们也可以实现 resolver 的继承，并结合继承和 typescript 泛型获得更好的类型安全，例如：

```typescript
import { Type } from '@nestjs/common'

function BaseResolver<T extends Type<unknown>>(classRef: T): any {
  // 设置 isAbstract: true 能让 GraphQL 不为这个类生成 SDL 
  @Resolver({ isAbstract: true })
  abstract class BaseResolverHost {
    @Query(
        (type) => [classRef],
        { name: `findAll${classRef.name}` }
    )
    async findAll(): Promise<T[]> {
      return [];
    }
  }
  return BaseResolverHost;
}
```

```ts
@Resolver((of) => Recipe)
export class RecipesResolver extends BaseResolver(Recipe) {
  constructor(private recipesService: RecipesService) {
    super();
  }
}
```

我们在 postman 上测试下 coffees 和 coffee 两个请求

```ts
// 请求
query {
    coffees {
        id
        name
        brand
        flavors {
            name
            category
        }
    }
    coffee(id: 1) {
        id
        name
        brand
    }
}

// 响应
{
    "data": {
        "coffees": [],
        "coffee": null
    }
}
```

![image-20240325094147294](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240325094147294.png)

## 四、Mutations

大多关于 GraphQL 的讨论主要集中于如何获取数据上，但是任何完整的数据平台都是需要修改服务端数据的方法的。在 REST 中，理论上每个请求都可以在服务端产生副作用，但是就前人总结的最佳实践来说，尽量不要在 GET 方法中修改服务端数据。

GraphQL 类似，每个 query 都有可能实现数据修改，但是，尽量还是遵守惯例，将所有涉及数据写入的操作通过 Mutation 实现。

我们先在 CoffeesResolver 中添加新的方法 create，并使用 @Mutation 装饰器标注该方法

```ts
@Mutation(() => String, { name: 'createCoffee', nullable: true })
async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    console.log(createCoffeeInput)
    return 'success ok'
}
```

该方法接收 CreateCoffeeInput 作为参数，并返回 'success ok'，目前我们还没有对接数据库，无法返回数据，暂时返回字符串代替。

由于该 mutation 函数接收的参数是一个复杂对象，我们可以使用 `@InputType()` 装饰器创建类型：

```ts
// resolvers/coffees/dto/create-coffee.input.ts
import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class CreateCoffeeInput {
  @Field(() => String, { description: 'A new coffee name' })
  name: string
  brand: string
  category: string
}
```

```graphql
// 生成的 schema.gql
type Mutation {
  createCoffee(createCoffeeInput: CreateCoffeeInput!): String
}

input CreateCoffeeInput {
  """A new coffee name"""
  name: String!
  brand: String!
  category: String!
}
```

我们在 postman 上测试下 createCoffee 请求，可以看到返回值正是我们设置的 `success ok`

```ts
// 请求
mutation {
    createCoffee(createCoffeeInput: {
        name: "test name",
        brand: "test brand",
        category: "test category"
    })
}

// 响应
{
    "data": {
        "createCoffee": "success ok"
    }
}
```

![image-20240325094011219](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240325094011219.png)

## 五、Subscriptions

除了使用 Query 查询数据和使用 Mutation 修改数据，GraphQL 规范还提供了第三种操作规范：Subscription。

当客户端选择监听服务端的实时信息时，服务端会通过 Subscription 的方式将数据推送给客户端，和使用 Query 查询某个字段集合时仅返回一次响应相比，Subscription 会开启一个信息通道，每当服务端发生特定事件时将响应发送至客户端。

但是，Subscription 并不是保持前后端状态一致的最佳方案，应该是在用户执行相关操作后，重新执行 Query 获取数据以更新状态。

常见的应用场景如下：

第一种，订阅对大对象的小增量修改。重复轮询大型对象对资源的消耗是昂贵的，尤其当大多数对象字段并不会经常发生更改，一般情况，应当使用 Query 查询数据的初始状态，并在更新发生时将其推送到指定字段。

另一种，低延迟实时更新。比如，聊天应用程序的客户端希望可以尽可能早地接收到新消息。

### （一）开启订阅功能

之前，我们想要开启订阅功能，需要在 GraphQLModule 的配置项上设置 `installSubscriptionHandlers: true` 

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    // 在 Apollo Driver 上激活 Subscription 功能
    installSubscriptionHandlers: true
})
```

但在最新版本的 Apollo 服务，该配置项已经被移除，并会在不久后废弃。Nestjs 官方推荐使用 `graphql-ws` 替代。

```ts
GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    // 在 Apollo Driver 上激活 Subscription 功能
    subscriptions: {
    	'graphql-ws': true
    }
})
```

### （二）基本使用

安装依赖

```bash
npm i graphql-subscriptions
```

创建 `PubsubModule`，引入并暴露 PubSub 类

```
nest g mo pubsub
```

```ts
import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions'

@Module({
    providers: [PubSub],
    exports: [PubSub]
})
export class PubsubModule {}
```

编写一个基本的 Subscription 函数，我们在上文编写的 coffee.resolver.ts 的基础上添加一个 coffeeAdded 函数。

```ts
import { Resolver, Query, ID, Args, Mutation, ResolveField, Parent, Subscription } from '@nestjs/graphql'
import { ParseIntPipe } from '@nestjs/common'
import { PubSub } from 'graphql-subscriptions'
import { CreateCoffeeInput } from './dto/create-coffee.input/create-coffee.input'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'

@Resolver(() => Coffee)
export class CoffeesResolver {

  constructor(private readonly pubsub: PubSub) {}

  @Query(() => [Coffee], { name: 'coffees' })
  async findAllCoffees() {
    return []
  }

  @Query(() => Coffee, { name: 'coffee', nullable: true })
  async findCoffeeById(@Args('id', { type: () => ID }, ParseIntPipe) id: number) {
    return null
  }

  @ResolveField('flavors', () => [Flavor])
  async getFlavors(@Parent() coffee: Coffee) {
    const { category } = coffee
    console.log(category)
    // return this.flavorService.findAllFlavors({ category })
    return [{ name: 'test flavor', category: 'test category' }]
  }

  @Mutation(() => String, { name: 'createCoffee', nullable: true })
  async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    console.log(createCoffeeInput)
    return 'success ok'
  }

  @Subscription((returns) => Coffee, { name: 'coffeeAdded' })
  subscribeToCoffeeAdded() {
    return this.pubsub.asyncIterator('coffeeAdded')
  }
}
```

新增的 coffeeAdded 函数通过调用 `pubsub.asyncIterator` 实现事件订阅。

`asyncIterator`接收一个参数 triggerName，表示触发订阅的事件名称。

启动项目，gql 文件会生成如下内容：

```graphql
type Subscription {
  coffeeAdded: Coffee!
}
```

订阅事件会返回一个以事件名【传递给 Subscription 装饰器的 name】为键的对象作为响应结果。

### （三）事件发布

订阅事件以后，可以使用 `PubSub.publish` 方法推送事件。一般是把 publish 逻辑写在 Mutation 中，在对象实体发生变化时触发客户端更新。

我们在之前定义的 `create` 方法中编写这部分代码：

```ts
import { Resolver, Query, ID, Args, Mutation, ResolveField, Parent, Subscription } from '@nestjs/graphql'
import { PubSub } from 'graphql-subscriptions'
import { CreateCoffeeInput } from './dto/create-coffee.input/create-coffee.input'
import { Coffee } from './entities/coffee.entity'
import { Flavor } from './entities/flavor.entity'

@Resolver(() => Coffee)
export class CoffeesResolver {

  constructor(private readonly pubsub: PubSub) {}

  @Mutation(() => Coffee, { name: 'createCoffee', nullable: true })
  async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    const newCoffee = {
      ...createCoffeeInput,
      id: +(Math.random() * 10).toFixed(0),
      flavors: []
    }
    console.log('new coffee', newCoffee)
    this.pubsub.publish('coffeeAdded', { coffeeAdded: newCoffee })
    return newCoffee
  }
    
  @Subscription((returns) => Coffee, { name: 'coffeeAdded' })
  subscribeToCoffeeAdded() {
    return this.pubsub.asyncIterator('coffeeAdded')
  }
}
```

`PubSub.publish` 方法需要接收两个参数：

1. `triggerName`：事件名
2. `payload`：数据负载

正如上文所提到的，Subscription 会返回具有特定结构的对象【`subscribeToCoffeeAdded` 需要返回 `Coffee` 实体】。需要注意的是，该对象必须用事件名作为键，包裹起来后再返回给客户端。否则，graphql 会在校验阶段报错。

测试下效果

**subscription**

```graphql
subscription CoffeeAdded {
    coffeeAdded {
        id
        name
        brand
        category
    }
}
```

**publish**

```graphql
mutation CreateCoffee {
    createCoffee(createCoffeeInput: {
        name: "test name",
        brand: "test brand",
        category: "test category"
    }) {
        id
        name
        brand
        category
        flavors {
            name
        }
    }
}
```

**return data**

```json
{
    "data": {
        "coffeeAdded": {
            "id": "6",
            "name": "test name",
            "brand": "test brand",
            "category": "test category"
        }
    }
}
```

![image-20240331162143077](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240331162143077.png)

### （四）其他配置

**filter**：事件过滤。仅返回符合条件的事件

```ts
@Subscription(
    (returns) => Coffee,
    {
        name: 'coffeeAdded',
        filter: (payload, variables) => (
        	payload.coffeeAdded.id === variables.id
        )
    }
)
subscribeToCoffeeAdded(@Args('id') id: number) {
	return this.pubsub.asyncIterator('coffeeAdded')
}
```

测试下效果，仅当 id 为 1 时放行事件

```
subscription CoffeeAdded {
    coffeeAdded(id: 1) {
        id
        name
        brand
        category
    }
}
```

![image-20240331163210166](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240331163210166.png)

**resolve**：修改数据。处理事件返回的响应数据

```ts
@Subscription(
    (returns) => Coffee,
    {
        name: 'coffeeAdded',
        // filter: (payload, variables) => (
        //   payload.coffeeAdded.id === variables.id
        // ),
        resolve(this: CoffeesResolver, value) {
            console.log(this)
            return value
        }
    }
)
subscribeToCoffeeAdded(@Args('id') id: number) {
    return this.pubsub.asyncIterator('coffeeAdded')
}
```

## 六、Scalars

GraphQL 对象类型的字段需要解析成具体的数据，这里就是**标量类型**的用武之地。

GraphQL 包含几个默认的类型： `Int`、`Float`、`String`、`Boolean` 和 `ID`，除了这些内置的类型，还有比如 `Date` 等数据类型。

### （一）标量类型

Code-first 方法附带了五个标量类型，其中三个就是 GraphQL 默认类型的别名。

- `ID` （别名：`GraphQLID`）： 表示一个唯一的标识符，通常用于获取数据或作为缓存的键
- `Int` （别名：`GraphQLInt`）： 带符号的 32 位整数
- `Float` （别名：`GraphQLFloat`）： 带符号的双精度浮点数
- `GraphQLISODateTime` ：UTC格式的日期时间字符串（默认用于表示' Date '类型）
- `GraphQLTimestamp` - 时间戳，一个有符号整数，表示日期和时间

默认情况下，`GraphQLISODateTime`会用于表示 Date 类型，如果希望使用 GraphQLISODateTime 替代的话，可以通过设置 `dateScalarMode: 'timestamp'` 实现，如下：

```ts
GraphQLModule.forRoot({
  buildSchemaOptions: {
    dateScalarMode: 'timestamp',
  }
})
```

我们可以对比下设置前后查询 Date 类型数据时的返回结果

设置前：

![image-20240406165743349](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240406165743349.png)

设置后：

![image-20240406165828596](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240406165828596.png)

可以看出，设置 `dateScalarMode: 'timestamp'` 后返回 createAt 字段值被转换成了时间戳。

### （二）重写默认标量

除了设置 `dateScalarMode`外，我们还可以通过重写 Date 标量本身来实现转换为时间戳的需求。

```ts
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', (type) => Date)
export class DateScalar implements CustomScalar<number, Date> {
  description = 'Date custom scalar type'

  parseValue(value: number): Date {
    return new Date(value)
  }

  serialize(value: Date): number {
    return value.getTime()
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value)
    }
    return null
  }
}
```

对比修改配置的方式，重写 Date 标量无疑给开发者更高的自由度，能够实现更加灵活的功能。

> 注：`CustomScalar<number, Date>` 写在泛型中的两个类型
>
> ```ts
> interface CustomScalar<T, K> {
>  description?: string;
>  parseValue: GraphQLScalarValueParser<K>;
>  serialize: GraphQLScalarSerializer<T>;
>  parseLiteral: GraphQLScalarLiteralParser<K>;
> }
> ```
>
> 查看该类的类型声明可知，第一个类型表示序列化函数 serialize 参数的类型，第二个类型则表示剩余两个方法的参数类型

使用重写后的标量，直接将其添加到目标模块的 providers 中即可

```ts
import { Module } from '@nestjs/common'
import { DateScalar } from '@/scalars/date.scalar';
import { CoffeesResolver } from './coffees.resolver'
import { CoffeesService } from './coffees.service';

@Module({
  providers: [
    CoffeesResolver,
    CoffeesService,
    // Date 标量
    DateScalar
  ],
  imports: []
})
export class CoffeesModule {}
```

### （三）自定义标量

自定义标量需要用到 `GraphQLScalarType` 这个类。我们需要分别实现三个方法：

1. serialize
   - **作用**：将值从内部值序列化为有效的外部值输出。
   - **使用场景**：当 GraphQL 字段解析器返回一个值时，该值将被传入 `serialize`。返回值将作为该字段的最终有效响应。
2. parseValue
   - **作用**：将值从传入的反序列化外部值解析为有效的内部值。
   - **使用场景**：当该标量用作查询的变量或输入字段的参数时，将调用此方法保证与数据库存储结果一致。
3. parseLiteral
   - **作用**：将AST（抽象语法树）的值解析为有效的内部值。
   - **使用场景**：当该标量作为查询或输入值的内联常量时将调用此方法。

下文的示例中，我们会创建一个 UUID 的标量，用来校验参数或返回值中的 UUID 是否有效

```typescript
const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validate(uuid: unknown): string | never {
  if (typeof uuid !== "string" || !regex.test(uuid)) {
    throw new Error("invalid uuid");
  }
  return uuid;
}

export const CustomUuidScalar = new GraphQLScalarType({
  name: 'UUID',
  description: 'A simple UUID parser',
  serialize: (value) => validate(value),
  parseValue: (value) => validate(value),
  parseLiteral: (ast) => validate(ast.value)
})
```

```typescript
@Module({
  imports: [
    GraphQLModule.forRoot({
      resolvers: { UUID: CustomUuidScalar },
    }),
  ],
})
export class AppModule {}
```

```typescript
@Field((type) => CustomUuidScalar)
uuid: string;
```

## 七、Interfaces

### （一）类型接口

首先，我们先定义一个抽象类型接口 `Character`，该接口需要使用 `@InterfaceType()` 装饰器标注。

```ts
// src/interfaces/character.interface.ts
import { Field, ID, InterfaceType } from '@nestjs/graphql'

@InterfaceType()
export abstract class Character {
  @Field(() => ID)
  id: number

  @Field()
  name: string
}
```

我们在接口中定义了两个属性：id 和 name，分别为 ID 和 String 类型，之后在实现具体接口时必须包含这两个字段。

```ts
// src/human/entities/human.entity.ts
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Character } from '@/interfaces/character.interface'

@ObjectType({
  implements: () => [Character]
})
export class HumanEntity implements Character {
  @Field(() => ID)
  id: number
  name: string
  job: string
}
```

上面的代码中，除了继承 `Character` 类的原有字段，还添加了新的`job` 字段以实现 `HumanEntity` 类。

> 该类需要在 `@ObjectType` 装饰器中添加 `implements: () => [Character]`。

完成类型声明后，我们可以创建新的 resolver 文件，尝试使用定义好的类型。

```ts
// src/human/human.resolver.ts
import { Args, Info, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { HumanEntity } from './entities/human.entity'

@Resolver(() => HumanEntity)
export class HumanResolver {

  constructor() {}

  @Query(() => HumanEntity, { name: 'characters' })
  async findAllCharacters() {
    return { id: 1, name: 'character', job: 'frontend-developer' }
  }

  @ResolveField(() => [HumanEntity])
  friends(
    // 解析出来的 HumanEntity 对象，friends 字段将会被插入该对象返给客户端
    // Resolved object that implements HumanEntity
    @Parent() character,
    // HumanEntity 类
    // Type of the object that implements HumanEntity
    @Info() { parentType },
    @Args('name', { type: () => String }) name: string
  ) {
    console.log(character, parentType, name)
    return [{ id: 2, name: `test-${name}`, job: 'backend-developer' }]
  }
}
```

在 `human.resolver.ts` 中，我们实现了两个方法：

- findAllCharacters： 查询角色列表
- friends：生成 friends 字段

如果代码正确执行，我们可以在 schema.sql 文件里看到找到以下内容：

```graphql
interface Character {
  id: ID!
  name: String!
}
type HumanEntity implements Character {
  id: ID!
  name: String!
  job: String!
  friends(name: String!): [HumanEntity!]!
}
type Query {
  characters: HumanEntity!
}
```

打开 postman，测试下能否查询到我们写死的数据

```
query Characters {
    characters {
        id
        name
        friends(name: "aa") {
            id
            name
            job
        }
        job
    }
}
```

![image-20240404113524395](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240404113524395.png)

成功获取，完美。

### （二）联合类型

在定义联合类型之前，我们先定义两个子类型。

第一个子类型，复用下上章节定义过的 `HumanEntity` 类

```ts
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Character } from '@/interfaces/character.interface'

@ObjectType({
  implements: () => [Character]
})
export class HumanEntity implements Character {
  @Field(() => ID)
  id: number
  name: string
  job: string
}
```

第二个子类型，`Social` 类

```ts
// src/human/entities/social.entity.ts
import { ObjectType, createUnionType } from "@nestjs/graphql"
import { HumanEntity } from "./human.entity"

@ObjectType()
export class SocialEntity {
    url: string
}
```

创建联合类型需要使用 createUnionType 方法

> types 属性返回的数组必须使用 const 断言，否则会报错

```ts
export const ResultUnion = createUnionType({
    name: 'ResultUnion',
    types: () => [HumanEntity, SocialEntity] as const,
    resolveType: (value) => {
        if (value.id) return HumanEntity
        if (value.url) return Social
        return null
    }
})
```

默认的`resolveType` 函数会基于解析器方法返回的 value 抽离出类型，因此，我们在自定义 `resolveType` 函数是，返回值必须是 class 类，而不是 Javascript 对象。

此时我们可以在 query 中使用定义好的联合类型

```ts
import { Query, Resolver } from '@nestjs/graphql'
import { HumanEntity } from './entities/human.entity'
import { ResultUnion } from './entities/social.entity'

@Resolver(() => HumanEntity)
export class HumanResolver {
  constructor() {}

  @Query(() => [ResultUnion])
  search(): Array<typeof ResultUnion> {
    return [
      {
        id: 1,
        name: 'test aa',
        job: 'developer'
      },
      {
        url: 'https://github.com'
      }
    ]
  }
}
```

测试下

```
query Search {
    search {
        ... on HumanEntity {
            id
            name
            job
        }
        ... on SocialEntity {
            url
        }
    }
}
```

![image-20240404144328313](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240404144328313.png)

### （三）类型映射

在开发比如 CRUD 等功能时，从一个基础的实体类型开始构建不同的变体是很常见的处理办法。Nestjs 提供了多个实用函数帮助开发者处理类型转换任务。

比如，在分别为 create 和 update 方法创建 DTOs 时，因为二者所需要的字段名称上都是一致的，区别只是某些字段是否可选。

因此，往往并不需要创建两个 DTO 徒增工作量，直接在一个基础 DTO 上做处理即可。

```ts
import { Field, ID, InputType, OmitType, PartialType, PickType, extend } from "@nestjs/graphql";

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
export class UpdateUserInput extends PartialType(OmitType(UserInput, ['id', 'password'] as const)) {}
```

我们创建了四个 DTOs 来介绍常用的几个 Mapped Type。

第一个：基础实体 `UserInput`：包含 id、name 等表示用户信息的字段。

第二个 `CreateUserInput`：一般在比如注册场景中使用，以最常见的 "用户名+密码" 的形式，我们只需要用到 `UserInput` 中的 name 和 password。

> `PickType` 可以从一个类型实体中提取出部分字段生成新的类型实体

第三个 `ReadUserInput`：一般用于获取用户信息接口，出于安全性考虑，用户密码不推荐返回至客户端，我们需要除 password 以外的其他信息，此时更适合使用 `OmitType`

> `OmitType` 会使用传入的类型中的所有字段创建新的类型，并根据第二个参数移除其指定的字段

第四个`UpdateUserInput`：一般用于更新用户信息接口，我们只允许更新除了 id 和 password 以外的字段，此时可以组合多个 Mapped Types 实现

> `PartialType` 默认情况下，会使用第一个参数所引用的相同的装饰器来标注 PartialType 创建的新类型。如果你不希望继承第一个参数的装饰器，可以自己手动指定，如下：
>
> ```typescript
> @InputType()
> export class UpdateUserInput extends PartialType(User, InputType) {}
> ```

## 八、Field Middleware

Field Middleware 可以让我们在字段被解析之前或之后执行任意代码，比如转换字段的解析结果、校验字段参数等。

首先，我们可以从创建一个简单的中间件开始，它会在字段值被发送回客户端之前将其打印出来。

```ts
// src/middleware/logger.middleware.ts
import { FieldMiddleware, MiddlewareContext, NextFn } from "@nestjs/graphql";

export const LoggerMiddleware: FieldMiddleware = async (
    ctx: MiddlewareContext,
    next: NextFn
) => {
    const value = await next()
    console.log('logger', value)
    return value
}
```

之后，将该中间件绑定到上章节定义的 SocialEntity 上

```ts
@ObjectType()
export class SocialEntity {
  @Field({ middleware: [LoggerMiddleware] })
  url: string
}
```

重新调用一遍请求，可以看到在编辑器终端看到打印的结果，如下：

![image-20240404152737363](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240404152737363.png)

除此之外，我们还可以对返回的字段值做一些处理，再创建一个 `upper.middleware.ts` 文件，并将新的 `UpperMiddleware` 绑定到 url 字段上

```ts
import { MiddlewareContext, NextFn } from '@nestjs/graphql'

export const UpperMiddleware: FieldMiddleware = async (
    ctx: MiddlewareContext,
    next: NextFn
) => {
  const value = await next()
  return value?.toUpperCase()
}
```

```ts
@ObjectType()
export class SocialEntity {
  @Field({ middleware: [LoggerMiddleware, UpperMiddleware] })
  url: string
}
```

看下结果，所有字符都已经被转换为大写了

![image-20240404154208415](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240404154208415.png)

从上面的示例中可以看出，Nestjs 有提供为字段绑定多个中间件的能力，它们会按顺序被依次调用，数组中的第一个元素会最先被调用，最后执行结束

因此，在上面的示例中，会按 `LoggerMiddleware -->  UpperMiddleware` 的顺序调用中间件，并按 `UpperMiddleware  -->  LoggerMiddleware` 返回数据

除了 **@Field** 装饰器，字段中间件还可以被用在 **@ResolveField** 中或全局调用

```ts
@ResolveField(
    () => String,
    {
        middleware: [loggerMiddleware]
    }
)
title() {
  return 'Placeholder';
}
```

```ts
GraphQLModule.forRoot({
  autoSchemaFile: 'schema.gql',
  buildSchemaOptions: {
    fieldMiddleware: [loggerMiddleware],
  }
})
```

## 九、Plugins

Nestjs 的插件系统继承了 Apollo Server 的核心功能，可以在 GraphQL 请求生命周期的特定阶段，或是Apollo Server 启动时执行自定义操作。

首先介绍下，在 Nest 应用中如何使用插件。

自定义的插件需要使用 @Plugin 装饰器标注，同时，可以通过实现 ApolloServerPlugin 类来获得更好的代码补全提示。

```typescript
import {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContext,
  GraphQLRequestListener
} from '@apollo/server'
import { Plugin } from '@nestjs/apollo'

@Plugin()
export class LoggerPlugin implements ApolloServerPlugin {
  async requestDidStart(
    requestContext: GraphQLRequestContext<BaseContext>
  ): Promise<void | GraphQLRequestListener<BaseContext>> {
    console.log('logger.plugin: ', 'request started')
    return {
      async willSendResponse() {
        console.log('will send response')
      }
    }
  }
}
```

我们在之前定义过的 coffees.moudule.ts 中使用该插件，并重新查询一次。

```ts
import { Module } from '@nestjs/common'
import { PubsubModule } from '@/resolvers/pubsub/pubsub.module'
import { LoggerPlugin } from '@/plugins/logger.plugin'
import { CoffeesResolver } from './coffees.resolver'

@Module({
  providers: [CoffeesResolver, LoggerPlugin],
  imports: [PubsubModule]
})
export class CoffeesModule {}
```

返回结果如下，可以看出我们的自定义插件是生效的。

![image-20240405164145644](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240405164145644.png)



## 十、CRUD

在本章节，我们会在之前编写的 coffees 模块基础上编写一套 CRUD 接口，实践下前文学习的内容。

### （一）连接数据库

我用的数据库是 MongoDB。如果你用的数据库与示例不同，可以先看看 graphql 部分的代码，然后用自己习惯的数据库实现这些功能。

```ts
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { MongooseModule } from '@nestjs/mongoose'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoffeesModule, PubsubModule } from './resolvers'

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
    // 连接我们的 mongodb 数据库
    MongooseModule.forRootAsync({
      useFactory: async () => {
        return { uri: 'mongodb://localhost:27017/meleon' }
      },
    }),
    CoffeesModule,
    PubsubModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
```

### （二）创建实体

分别创建 `CoffeeEntity` 和 `FlavorEntity` 

```ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Document } from 'mongoose'
import { MinLength } from 'class-validator'
import { FlavorEntity } from './flavor.entity'

@Schema()
@ObjectType({ description: 'Coffee Model' })
export class CoffeeEntity extends Document {
  @Prop()
  @Field(() => ID, { nullable: false, description: 'A unique identifier' })
  id: string
  
  @Prop()
  @MinLength(3)
  name: string

  @Prop()
  brand: string

  @Prop()
  category: string

  @Prop()
  @Field(() => [FlavorEntity], { nullable: 'items' })
  flavors?: FlavorEntity[]

  @Prop()
  @Field()
  createAt?: Date
}

export const CoffeeSchema = SchemaFactory.createForClass(CoffeeEntity)
```

```ts
// resolvers/coffees/entities/flavor.entity.ts
import { Field, ID, ObjectType } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
@ObjectType()
export class FlavorEntity {
  @Prop()
  @Field(() => ID, { nullable: true, description: 'A unique identifier for flavor' })
  id: number
  
  @Prop()
  name: string
  
  @Prop()
  category: string
}

export const FlavorSchema = SchemaFactory.createForClass(FlavorEntity)
```

这两个类型实体是我们编写接口代码的基础，包括上述代码中已经演示的创建 Mongoose Schema，还承担参数校验、连接 collections 等任务，后续会经常直接或间接地用到它们。

### （三）连接 Collections

在创建类型实体时，也顺便创建了对应的 Schema，我们需要用到它们来连接数据库中对应的 Collections。

进入 coffees.module.ts 文件

```ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose';
import { PubsubModule } from '@/resolvers/pubsub/pubsub.module'
import { LoggerPlugin } from '@/plugins/logger.plugin'
import { CoffeesResolver } from './coffees.resolver'
import { CoffeesService } from './coffees.service';
import { CoffeeEntity, CoffeeSchema } from './entities/coffee.entity';
import { FlavorEntity, FlavorSchema } from './entities/flavor.entity';

@Module({
  providers: [
    CoffeesResolver,
    LoggerPlugin,
    CoffeesService
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
```

我们会分别连接到 `coffees` 和 `flavors` 两个 `collection`。

### （四）查询功能

查询功能相对比较简单，不需要我们定义新的 DTO。

我们分别定义 `findAllCoffees` 和 `findCoffeeById` 两个方法

```ts
// resolvers/coffees/coffee.resolver.ts
@Resolver(() => CoffeeEntity)
export class CoffeesResolver {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Query(() => [CoffeeEntity], { name: 'coffees' })
  async findAllCoffees() {
    return this.coffeesService.findAll()
  }

  @Query(() => CoffeeEntity, { name: 'coffee', nullable: true })
  async findCoffeeById(@Args('id', { type: () => ID }) id: string) {
    return this.coffeesService.findOne(id)
  }
}
```

在编写 services 功能时，考虑到其他接口可能需要用到同样的功能，最好将通用功能抽离出来，方便后续开发。

```ts
@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(CoffeeEntity.name) private readonly coffeeModel: Model<CoffeeEntity>,
    @InjectModel(FlavorEntity.name) private readonly flavorModel: Model<FlavorEntity>,
    private readonly pubsub: PubSub
  ) {}

  async findAll() {
    return await this.coffeeModel.find()
  }

  async findOne(id: string) {
    return await this.coffeeModel.findOne({ _id: id })
  }
}
```

`findAllCoffees` 功能演示

![image-20240406182744562](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240406182744562.png)

`findCoffeeById`功能演示

![image-20240406182829986](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240406182829986.png)

### （五）创建功能

第一步，确定参数类型，创建 DTO

```ts
// resolvers/coffees/dto/create-coffee.input.ts
@InputType()
export class CreateCoffeeInput extends PickType(CoffeeEntity, ['name', 'brand', 'category'] as const, InputType) {}
```

这里我们会用到第七节里提到到 PickType，直接从 CoffeeEntity 中提取我们需要的字段

> 注：`CoffeeEntity` 用的是 `@ObjectType` 装饰器，此处需要传入第三个参数，指明当前类的装饰器类型

第二步，在 service 中编写功能

```ts
// resolvers/coffees/coffee.service.ts
@Injectable()
export class CoffeesService {
    constructor(
        @InjectModel(CoffeeEntity.name) private readonly coffeeModel: Model<CoffeeEntity>,
        @InjectModel(FlavorEntity.name) private readonly flavorModel: Model<FlavorEntity>,
        private readonly pubsub: PubSub
    ) {}

    async findOne(id: string) {
        return await this.coffeeModel.findOne({ _id: id })
    }

    async create(createCoffeeInput: CreateCoffeeInput) {
        const res = await this.coffeeModel.create({ ...createCoffeeInput, createAt: new Date() })
        const savedCoffee = await res.save()

        savedCoffee.id = savedCoffee._id.toString()
        this.pubsub.publish('coffeeAdded', { coffeeAdded: savedCoffee })
        return savedCoffee
    }
}
```

第三步，创建接口处理器，使用 `@Arg` 接收参数

```ts
// resolvers/coffees/coffee.resolver.ts
@Resolver(() => CoffeeEntity)
export class CoffeesResolver {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Mutation(() => CoffeeEntity, { name: 'createCoffee', nullable: true })
  async create(@Args('createCoffeeInput') createCoffeeInput: CreateCoffeeInput) {
    return this.coffeesService.create(createCoffeeInput)
  }
}
```

`create`功能演示

![image-20240406183158122](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240406183158122.png)

### （六）更新与删除

更新功能与删除功能参照创建接口的步骤，按部就班即可。

```ts
// resolvers/coffees/dto/update-coffee.input.ts
@InputType()
export class UpdateCoffeeInput extends PartialType(CreateCoffeeInput) {}
```

```ts
// resolvers/coffees/coffee.service.ts
@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(CoffeeEntity.name) private readonly coffeeModel: Model<CoffeeEntity>,
    @InjectModel(FlavorEntity.name) private readonly flavorModel: Model<FlavorEntity>,
    private readonly pubsub: PubSub
  ) {}

  async update(id: string, updateCoffeeInput: UpdateCoffeeInput) {
    const res = await this.coffeeModel.updateOne(
      {
        _id: id
      },
      {
        $set: updateCoffeeInput
      }
    )
    const { matchedCount, modifiedCount } = res
    if (matchedCount >= 1 && modifiedCount === 1) {
      const res = await this.findOne(id)
      res.id = res._id.toString()
      return res
    } else {
      return null
    }
  }

  async delete(id: string) {
    const res = await this.coffeeModel.deleteOne({ _id: id })
    if (res.deletedCount > 0) return true
    else return false
  }

  async getFlavorsByCategory(category: string) {
    const res = await this.flavorModel.find({ category })
    return res || []
  }
}
```

```ts
// resolvers/coffees/coffee.resolver.ts
@Resolver(() => CoffeeEntity)
export class CoffeesResolver {
  constructor(
    private readonly pubsub: PubSub,
    private readonly coffeesService: CoffeesService
  ) {}

  @ResolveField('flavors', () => [FlavorEntity])
  async getFlavors(@Parent() coffee: CoffeeEntity) {
    const { category } = coffee
    return this.coffeesService.getFlavorsByCategory(category)
  }

  @Mutation(() => CoffeeEntity, { name: 'updateCoffee', nullable: true })
  async update(
    @Args('id') id: string,
    @Args('updateCoffeeInput') updateCoffeeInput: UpdateCoffeeInput
  ) {
    return this.coffeesService.update(id, updateCoffeeInput)
  }

  @Mutation(() => Boolean, { name: 'deleteCoffee', nullable: true })
  async delete(@Args('id') id: string) {
    return this.coffeesService.delete(id)
  }
}
```

> `getFlavors` 会在客户端需要返回 flavors 字段时，根据 coffee 中的 category 查询数据

`update` 功能演示

![image-20240406185242129](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240406185242129.png)

`delete` 功能演示

![image-20240406185452009](C:\Users\23200\AppData\Roaming\Typora\typora-user-images\image-20240406185452009.png)

## 十一、Conclusion

趁假期学习了下 Nestjs GraphQL 相关的章节，整体看来，Nestjs 官网对于这部分的介绍还是比较全面的，开发中可能涉及到的概念基本上都有相关的章节做介绍，带领入门完全足够。

但是，由于 Nestjs GraphQL 既支持多种驱动服务器，又支持 Code First 和 Schema First 两种编码风格，在更细节的内容的介绍上，肯定做不到尽善尽美，比如 Plugin 章节，涉及到 Apollo Server 生命周期的部分仅提供了使用部分生命周期的示例。深入研究的话还是要去看下对应驱动服务器的官方文档。

以上，暂时结束这一章节后，目前计划是把 Nestjs 官网上最后一个大篇章 MicroService 学习完，害，任重而道远！