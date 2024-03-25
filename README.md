## 一、引言

**GraphQL** 是一种强大的 API 查询语言和运行时，用于实现使用现有数据的查询。

它提供了一种优雅的方法，可以解决通常在 REST API 中发现的许多问题，同时与 **TypeScript** 相结合，可以帮助我们编写的 GraphQL 查询拥有更好的类型安全，从而实现端到端的类型化。

学习之前，作为背景知识，可以了解下 GraphQL 和 REST 之间的**区别**。

本文会重点介绍如何使用内置的 `@nestjs/graphql` 模块。

`GraphQLModule` 可以配置为使用 **Apollo** 服务器(使用 `@nestjs/apollo` 驱动程序)和 **Mercurius**(使用 `@nestjs/mercurius`)。Nestjs 为这些经过验证的 GraphQL 软件包提供了官方集成，以提供一种简单的方式在 Nest 中使用 GraphQL。

## 二、快速开始

### （一）介绍

Nest提供了两种构建 GraphQL 应用程序的方式：**代码优先**和**模式优先**。你可以选择你更偏爱的方式，在本章节中，大多数 GraphQL 相关的片段都分为这两个主要部分。

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
// coffees/entities/coffee.entity.ts
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
// coffees/entities/flavor.entity.ts
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
// /coffees/coffees.resolver.ts
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

## 四、Mutations

大多关于 GraphQL 的讨论主要集中于如何获取数据，但是任何完整的数据平台也需要编辑服务端数据的方法。在 REST 中，每个请求都可以在服务端产生副作用，但是按REST的最佳实践来说，GET 方法尽量不要修改服务端数据。

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
// /coffees/dto/create-coffee.input.ts
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