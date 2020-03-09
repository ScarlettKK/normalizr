# normalizr

实现一个叫做`shopeelize`的库，可以用于将嵌套对象**范式化**，或者将范式化的数据**还原成嵌套对象**。

该库包含以下四个API
* schema.Entity
* normalize
* denormalize
* Entity实例的define函数

## API详情
### schema.Entity
这是一个Entity类，可以使用new来创建一个Entity实例，Entity实例是用来表示某种类型的数据的结构是怎么样的。
#### 用法
```javascript
new schema.Entity(name, entityParams?, entityConfig?)
```

#### 参数说明
这个函数会返回一个Entity实例，具体参数如下：
* name: 字符串，该Entity的名称
* entityParams：对象，为可选参数，定义该Entity实例的外键，定义的外键可以不存在
* entityConfig：对象，为可选参数，目前仅支持一个参数idAttribute，这个参数是定义该entity的主键，默认值为**字符串'id'**

### normalize
这个函数根据指定的Entity实例来范式化输入的数据
#### 用法
```javascript
normalize(data, entity)
```
#### 参数说明
这个函数会返回范式化后的数据，具体参数如下：
* data: 对象或者数组，需要范式化的数据，必须为符合Entity定义的对象或由该类对象组成的数组
* entity: Entity实例或者Entity数组。Entity数组表示data为符合该Entity结构的对象组成的数组

#### 例子
范式化数据

```javascript
import { normalize, schema } from 'shopeelize'

const originalData = {
  "id": "123",
  "author":  {
    "uid": "1",
    "name": "Paul"
  },
  "title": "My awesome blog post",
  "comments": {
    total: 100,
    result: [{
        "id": "324",
        "commenter": {
        "uid": "2",
          "name": "Nicole"
        }
      }]
  }
}

// Define a users schema
const user = new schema.Entity('users', {}, {
  idAttribute: 'uid'
})

// Define your comments schema
const comment = new schema.Entity('comments', {
  commenter: user
})

// Define your article
const article = new schema.Entity('articles', {
  author: user,
  comments: {
    result: [ comment ]
  }
})

const normalizedData = normalize(originalData, article)
```

`normalizedData`的值为：

```json
{
  "result": "123",
  "entities": {
    "articles": {
      "123": {
        "id": "123",
        "author": "1",
        "title": "My awesome blog post",
        "comments": {
              "total": 100,
              "result": [ "324" ]
        }
      }
    },
    "users": {
      "1": { "uid": "1", "name": "Paul" },
      "2": { "uid": "2", "name": "Nicole" }
    },
    "comments": {
      "324": { "id": "324", "commenter": "2" }
    }
  }
}
```
上面的数据中，result表示这次范式化拿到的指定的Entity id，也可以是id的数组，这由normalize的第二个参数是不是数组来决定。

### denormalize
将范式化后的数据恢复为原来的样子
#### 用法
```javascript
denormalize(normalizedData, entity, entities)
```
#### 参数说明
* normalizedData: 需要反范式化的数据，它是id或者id的数组
* entity: Entity实例，或者Entity实例的数组
* entities: 范式化后的数据对象，一般为normalize返回的数据的entities字段

## 用例
还原范式化数据

```javascript
const { result, entities } = normalizedData

const denormalizedData = denormalize(result, article, entities)
```

`denormalizedData`的值应该和`originalData`一致

## 示例：

```javascript
import { schema, normalize, denormalize } from 'shopeelize'

const page = new schema.Entity('page', {})
const user = new schema.Entity('user', {}, {})
const book = new schema.Entity('book', {
  pages: [ page ],
  author: user
})
const comment = new schema.Entity('comment', {
  commenter: user
})

const mybook = new schema.Entity('mybook', {
  author: user,
  books: [ book ],
  comments: {
    result: [ comment ]
  }
}, { idAttribute: 'customizedId' })

// 对应的originalData, 注意这里原始数据没有包含`books`字段
const mybookOriginalData = {
  customizedId: '666',
  author: { id: '12345', name: 'uname' },
  comments: {
    total: 100,
    result: [{
        id: 'comment1',
        commenter: {
          id: '999',
          name: 'Shopee'
        }
      }, {
        id: 'coment2',
        commenter: {
          id: '999',
          name: 'Shopee'
        }
    }]
  }
}
const normalizedData = normalize(mybookOriginalData, mybook)
const users = denormalize(['999'], [user], normalizedData.entities)
```
`users`的值是：
```javascript
[
  {
    id: '999',
    name: 'Shopee'
  }
]
```
### Entity实例的define函数
这个函数是Entity实例的，用来确保在Entity实例之间存在循环依赖的时候denormalize也可以使用
#### 用法
```javascript
import { schema, denormalize } from 'shopeelize'

const user = new schema.Entity('users')

user.define({
  friends: [user]
})

const normalizedData = {
  entities: {
    users: {
      123: {
        friends: [123],
        id: 123
      }
    }
  },
  result: 123
}

const user = denormalize(123, user, normalizedData)
```
`user`的值为：
```javascript
{
  "friends": [
    [Circular],
  ],
  "id": 123,
}
```
Circular表示该用户的第一个friend就是它自己，就是对象的循环引用的关系，这个是难点。
## 编写要求
* 使用[Jest](http://facebook.github.io/jest/)编写对应的单元测试，要求测试案例尽量详尽
* 请遵循[JavaScript Standard Style](https://standardjs.com/)

## hints
* 作为一个开源的库，在规划你的代码的时候，你应该尽可能多地考虑到用户出现的不规范操作
* normalize 方法也需要考虑循环依赖的情况

## 规范性参考：solid

Single Responsibility Principle

	一个类只干一件事情，要不管理属性，要不管理类数据库，不能同时干两件事情（避免耦合）

Open-Closed Principle

	增加新的功能时，相关联的其他函数/类等应该尽可能的避免被改动，如根据类别进行判断操作，应该把该操作合并在类的方法中，而不是在外面进行判断

	这样每增加一个类别就不用改动这个外部的函数，直接在创建类的时候定义好方法即可

Liskov Substitution Principle

	父类怎么样接收跟返回参数，子类也要照样行

	外面的函数应该尽可能少的知道类的内部信息

Interface Segregation Principle

	一个类不要添加对其没有意义的方法

Dependency Inversion Principle

	方法与类之间的关联应该是抽象类，而不是类本身，这样提供了更多的灵活性